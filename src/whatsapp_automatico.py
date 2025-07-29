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

# 📁 Rutas
carpeta_datos = os.path.expanduser("~/Downloads")
lock_file = "/Users/richardruiz/selenium_profiles/automation.lock"
profile_path = "/Users/richardruiz/selenium_profiles/shared_profile"
os.makedirs(profile_path, exist_ok=True)

# ✨ Genera una respuesta según el estado del pedido
def generar_respuesta_para_estado(estado, numero_orden):
    respuestas = {
        "solicitado": (
            f"¡Hola! Queremos confirmarte que hemos recibido tu pedido #{numero_orden}. "
            "Nuestro equipo ya está trabajando para prepararlo con mucho cuidado. "
            "Gracias por confiar en nosotros."
        ),
        "listo": (
            f"Nos complace informarte que tu pedido #{numero_orden} está listo para ser entregado. "
            "Agradecemos tu paciencia y esperamos que lo disfrutes!."
        ),
        "pagado": (
            f"Confirmamos la recepción del pago correspondiente al pedido #{numero_orden}. "
            "Gracias por elegirnos, estamos a tu disposición para cualquier consulta."
        ),
        "cancelado": (
            f"Lamentamos informarte que el pedido #{numero_orden} ha sido cancelado. "
            "Si necesitas asistencia o deseas más información, por favor no dudes en contactarnos. "
            "Estamos aquí para ayudarte."
        )
    }
    return respuestas.get(
        estado.lower(),
        f"El estado de tu pedido #{numero_orden} ha cambiado a: '{estado}'. "
        "Si tienes alguna pregunta o requieres asistencia, estamos disponibles para ayudarte."
    )

# 📖 Lee los datos del archivo .txt
def leer_datos_archivo(ruta_archivo):
    with open(ruta_archivo, "r", encoding="utf-8") as f:
        lineas = f.read().splitlines()
        if len(lineas) < 3:
            raise ValueError("El archivo debe contener tres líneas: número, estado y número de orden")
        numero = lineas[0].strip()
        estado = lineas[1].strip()
        numero_orden = lineas[2].strip()
    return numero, estado, numero_orden

# 🧠 Escribe el mensaje letra por letra
def escribir_lento(elemento, texto, delay=0.2):
    for letra in texto:
        elemento.send_keys(letra)
        time.sleep(delay)

# 🚀 Procesa el archivo .txt y envía el mensaje
def procesar_archivo(archivo):
    if not os.path.exists(archivo):
        print(f"⚠️ Archivo no encontrado al intentar procesar: {archivo}")
        return

    while os.path.exists(lock_file):
        print("🔒 Otra automatización está corriendo. Esperando 5 segundos...")
        time.sleep(5)

    with open(lock_file, "w") as f:
        f.write("lock")

    try:
        numero_telefono, estado, numero_orden = leer_datos_archivo(archivo)
        mensaje = generar_respuesta_para_estado(estado, numero_orden)
        print(f"📨 Enviando a: {numero_telefono} - Mensaje: {mensaje}")

        options = Options()
        options.add_argument(f"--user-data-dir={profile_path}")
        options.add_argument("--window-size=400,400")
        options.add_argument("--headless=new")  # ✅ MODO INVISIBLE

        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        driver.get("https://web.whatsapp.com")

        wait = WebDriverWait(driver, 60)

        nuevo_chat_xpath = "/html/body/div[1]/div/div/div[3]/div/div[3]/header/header/div/span/div/div[1]/button"
        overlay_xpath = "//div[contains(@class,'x9f619') and contains(@role,'dialog')]"

        wait.until(EC.presence_of_element_located((By.XPATH, nuevo_chat_xpath)))
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

# 👀 Manejador de eventos: observa archivos nuevos
class WatcherHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return

        nombre_archivo = os.path.basename(event.src_path)

        # ✅ Verifica nombre y extensión
        if not (nombre_archivo.endswith(".txt") and nombre_archivo.startswith("msg")):
            return

        time.sleep(0.5)

        if not os.path.exists(event.src_path):
            return

        print(f"📥 Archivo detectado: {event.src_path}")

        try:
            with open(event.src_path, "r", encoding="utf-8") as f:
                lineas = f.read().splitlines()

            if len(lineas) == 3 and all(lineas):
                print("✅ Formato válido. Procesando...")
                procesar_archivo(event.src_path)
        except Exception as e:
            print(f"❌ Error leyendo el archivo: {e}")

# 🏁 Punto de entrada
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
