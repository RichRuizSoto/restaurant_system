import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Rutas
carpeta_datos = "/Users/richardruiz/selenium_profiles/data"
lock_file = "/Users/richardruiz/selenium_profiles/automation.lock"
profile_path = "/Users/richardruiz/selenium_profiles/shared_profile"
os.makedirs(profile_path, exist_ok=True)

def leer_datos_archivo(ruta_archivo):
    with open(ruta_archivo, "r", encoding="utf-8") as f:
        lineas = f.read().splitlines()
        if len(lineas) < 2:
            raise ValueError("El archivo debe contener al menos dos líneas: número y mensaje")
        numero = lineas[0].strip()
        mensaje = lineas[1].strip()
    return numero, mensaje

def escribir_lento(elemento, texto, delay=0.2):
    for letra in texto:
        elemento.send_keys(letra)
        time.sleep(delay)

def procesar_archivo(archivo):
    # Evitar que varios procesos corran a la vez
    while os.path.exists(lock_file):
        print("🔒 Otra automatización está corriendo. Esperando 5 segundos...")
        time.sleep(5)

    # Crear lock file
    with open(lock_file, "w") as f:
        f.write("lock")

    try:
        numero_telefono, mensaje = leer_datos_archivo(archivo)
        print(f"📨 Enviando a: {numero_telefono} - Mensaje: {mensaje}")

        options = Options()
        options.add_argument(f"--user-data-dir={profile_path}")
        options.add_argument("--window-size=400,400")

        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        driver.get("https://web.whatsapp.com")
        driver.minimize_window()

        wait = WebDriverWait(driver, 60)

        nuevo_chat_xpath = "/html/body/div[1]/div/div/div[3]/div/div[3]/header/header/div/span/div/div[1]/button"
        overlay_xpath = "//div[contains(@class,'x9f619') and contains(@role,'dialog')]"

        try:
            wait.until(EC.presence_of_element_located((By.XPATH, nuevo_chat_xpath)))
        except:
            print("⛔ No se cargó WhatsApp Web. ¿Sesión iniciada?")
            raise

        try:
            wait.until(EC.invisibility_of_element_located((By.XPATH, overlay_xpath)))
        except:
            print("⚠️ Continuando sin esperar overlay...")

        driver.find_element(By.XPATH, nuevo_chat_xpath).click()
        time.sleep(2)

        input_numero_xpath = "/html/body/div[1]/div/div/div[3]/div/div[2]/div[1]/span/div/span/div/div[1]/div[2]/div/div/div[1]/p"
        input_numero = wait.until(EC.presence_of_element_located((By.XPATH, input_numero_xpath)))
        escribir_lento(input_numero, numero_telefono, delay=0.25)
        input_numero.send_keys(Keys.ENTER)
        time.sleep(5)

        mensaje_input_xpath = "/html/body/div[1]/div/div/div[3]/div/div[4]/div/footer/div[1]/div/span/div/div[2]/div/div[3]/div[1]/p"
        mensaje_input = wait.until(EC.presence_of_element_located((By.XPATH, mensaje_input_xpath)))
        mensaje_input.click()
        mensaje_input.send_keys(Keys.COMMAND + "a")
        mensaje_input.send_keys(Keys.DELETE)
        escribir_lento(mensaje_input, mensaje, delay=0.1)

        boton_enviar = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-tab='11']")))
        boton_enviar.click()

        print("✅ Mensaje enviado correctamente.")
        time.sleep(2)

    except Exception as e:
        print(f"❌ Error durante el envío: {e}")

    finally:
        try:
            if 'driver' in locals():
                driver.quit()
        except:
            pass

        try:
            os.remove(archivo)
            print(f"🗑 Archivo procesado y eliminado: {archivo}")
        except:
            print(f"⚠️ No se pudo eliminar el archivo: {archivo}")

        if os.path.exists(lock_file):
            os.remove(lock_file)
            print("🔓 Lock liberado. Puede iniciar otra instancia.")


class WatcherHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith(".txt"):
            print(f"📥 Nuevo archivo detectado: {event.src_path}")
            procesar_archivo(event.src_path)


if __name__ == "__main__":
    print("🚀 Monitoreando carpeta para nuevos mensajes...")

    event_handler = WatcherHandler()
    observer = Observer()
    observer.schedule(event_handler, carpeta_datos, recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Deteniendo monitoreo...")
        observer.stop()

    observer.join()
