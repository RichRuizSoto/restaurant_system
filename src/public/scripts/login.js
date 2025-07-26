console.log("✅ login.js cargado correctamente");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#loginForm");
  const nombreInput = document.getElementById("nombre");
  const claveInput = document.getElementById("clave");
  const rolSelect = document.getElementById("rol");
  const returnToField = document.getElementById("returnToField");

  // Obtener returnTo desde la URL y asignarlo al campo oculto
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('returnTo');
  console.log("🔍 Parámetro returnTo:", returnTo);

  if (returnTo && returnToField) {
    console.log("💾 Asignando returnTo al input oculto:", returnTo);
    returnToField.value = returnTo;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarErroresGenerales();

    const nombre = nombreInput.value.trim();
    const clave = claveInput.value.trim();
    const rol = rolSelect.value;
    const storedReturnTo = returnToField.value;

    // Obtener el token CSRF desde el formulario
    const csrfToken = document.querySelector('input[name="_csrf"]').value;

    let mensajeError = "";

    // Validaciones
    if (!validarNombre()) mensajeError += "El nombre de usuario es obligatorio.<br>";
    if (!validarClave()) mensajeError += "La contraseña debe tener al menos 8 caracteres, incluir letras y números.<br>";
    if (!validarRol()) mensajeError += "Debes seleccionar un rol.";

    if (mensajeError) {
      mostrarError(mensajeError);
      return;
    }

    // Verifica si returnTo es válido
    if (!storedReturnTo) {
      mostrarError("No hay una ruta de retorno válida. Intenta ingresar desde una página protegida.");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken, // Enviamos el token CSRF en los headers
        },
        credentials: "include", // Esto es necesario para incluir las cookies de sesión
        body: JSON.stringify({ nombre, clave, rol, returnTo: storedReturnTo }),
      });

      // Aquí se maneja el caso del error 401
      if (!response.ok) {
        const errorData = await response.json();
        let mensaje = errorData.error || "Error al iniciar sesión.";

        // Verificamos si es un error de acceso denegado
        if (response.status === 401) {
          mensaje = "Acceso no autorizado. Verifica tus credenciales o permisos.";
        }

        mostrarError(mensaje);
        return;
      }

      const data = await response.json();

      console.log("🔁 Redireccionando a:", data.redirectUrl);

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        mostrarError("No se proporcionó una URL de redirección válida.");
      }

    } catch (error) {
      mostrarError("Hubo un error al procesar la solicitud.");
      console.error(error);  // Esto ahora solo se ejecutará si hay un error fuera de la respuesta HTTP (conexión, etc.)
    }
  });

  // Validaciones
  function validarNombre() {
    const nombre = nombreInput.value.trim();
    if (!nombre) {
      mostrarErrorCampo(nombreInput, "El nombre de usuario es obligatorio.");
      return false;
    }
    limpiarErrorCampo(nombreInput);
    return true;
  }

  function validarClave() {
    const clave = claveInput.value.trim();
    const claveRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!clave) {
      mostrarErrorCampo(claveInput, "La contraseña es obligatoria.");
      return false;
    }
    if (!claveRegex.test(clave)) {
      mostrarErrorCampo(claveInput, "La contraseña debe tener al menos 8 caracteres, incluir letras y números.");
      return false;
    }
    limpiarErrorCampo(claveInput);
    return true;
  }

  function validarRol() {
    const rol = rolSelect.value;
    if (!rol) {
      mostrarErrorCampo(rolSelect, "Debes seleccionar un rol.");
      return false;
    }
    limpiarErrorCampo(rolSelect);
    return true;
  }

  function mostrarError(mensaje) {
    const container = document.getElementById("formErrorContainer");
    container.innerHTML = `<div class="error-message">${mensaje}</div>`;
    container.style.display = "block"; // 👈 mostrar si hay error
  }

  function limpiarErroresGenerales() {
    const container = document.getElementById("formErrorContainer");
    container.innerHTML = "";
    container.style.display = "none"; // 👈 ocultar si no hay error
  }

  function mostrarErrorCampo(campo, mensaje) {
    let errorSpan = campo.parentElement.querySelector(".error-text");
    if (!errorSpan) {
      errorSpan = document.createElement("span");
      errorSpan.className = "error-text";
      errorSpan.style.color = "#ff4d4d";
      campo.parentElement.appendChild(errorSpan);
    }
    errorSpan.textContent = mensaje;
  }

  function limpiarErrorCampo(campo) {
    const errorSpan = campo.parentElement.querySelector(".error-text");
    if (errorSpan) errorSpan.remove();
  }
});
