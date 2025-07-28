import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Variables
mensaje = "Hola, este es un mensaje automático"
numero_telefono = "61538992"

# Ruta fija para el perfil compartido (usar siempre la misma)
profile_path = "/Users/richardruiz/selenium_profiles/shared_profile"
os.makedirs(profile_path, exist_ok=True)

# Archivo lock para sincronizar procesos
lock_file = "/Users/richardruiz/selenium_profiles/automation.lock"

print("Esperando que no haya otra automatización corriendo...")

# Esperar indefinidamente hasta que el lock desaparezca
while os.path.exists(lock_file):
    print("Otra automatización está corriendo. Esperando 5 segundos...")
    time.sleep(5)

# Crear lock para bloquear otros procesos
with open(lock_file, "w") as f:
    f.write("lock")

try:
    # Configurar Chrome para usar perfil compartido
    options = Options()
    options.add_argument(f"--user-data-dir={profile_path}")
    options.add_argument("--window-size=400,400")

    # Inicializar webdriver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    driver.get("https://web.whatsapp.com")
    driver.minimize_window()

    def escribir_lento(elemento, texto, delay=0.2):
        for letra in texto:
            elemento.send_keys(letra)
            time.sleep(delay)

    print("⏳ Esperando que WhatsApp Web cargue completamente...")

    wait = WebDriverWait(driver, 60)

    nuevo_chat_xpath = "/html/body/div[1]/div/div/div[3]/div/div[3]/header/header/div/span/div/div[1]/button"
    overlay_xpath = "//div[contains(@class,'x9f619') and contains(@role,'dialog')]"

    try:
        wait.until(EC.presence_of_element_located((By.XPATH, nuevo_chat_xpath)))
    except Exception:
        print("⚠️ Tiempo de espera excedido, verifica que hayas iniciado sesión en WhatsApp Web.")
        driver.quit()
        exit()

    try:
        wait.until(EC.invisibility_of_element_located((By.XPATH, overlay_xpath)))
    except Exception:
        print("⚠️ No se detectó overlay o no desapareció a tiempo. Continuando igual...")

    print("✅ Interfaz cargada. Continuando...")

    driver.find_element(By.XPATH, nuevo_chat_xpath).click()
    time.sleep(2)

    input_numero_xpath = "/html/body/div[1]/div/div/div[3]/div/div[2]/div[1]/span/div/span/div/div[1]/div[2]/div/div/div[1]/p"
    input_numero = wait.until(EC.presence_of_element_located((By.XPATH, input_numero_xpath)))
    time.sleep(1)
    escribir_lento(input_numero, numero_telefono, delay=0.25)
    time.sleep(1)
    input_numero.send_keys(Keys.ENTER)
    time.sleep(5)

    mensaje_input_xpath = "/html/body/div[1]/div/div/div[3]/div/div[4]/div/footer/div[1]/div/span/div/div[2]/div/div[3]/div[1]/p"
    mensaje_input = wait.until(EC.presence_of_element_located((By.XPATH, mensaje_input_xpath)))

    mensaje_input.click()
    time.sleep(0.5)
    mensaje_input.send_keys(Keys.COMMAND + "a")  # Para Mac
    mensaje_input.send_keys(Keys.DELETE)
    time.sleep(0.5)

    escribir_lento(mensaje_input, mensaje, delay=0.1)
    time.sleep(1)

    boton_enviar = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-tab='11']")))
    boton_enviar.click()

    print("✅ Mensaje enviado correctamente.")

    time.sleep(2)
    driver.quit()

finally:
    # Quitar el lock para liberar otras automatizaciones
    if os.path.exists(lock_file):
        os.remove(lock_file)
    print("Archivo lock eliminado. Puede iniciar la siguiente automatización.")
