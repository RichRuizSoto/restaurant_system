document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#loginForm");
  const nombreInput = document.getElementById("nombre");
  const claveInput = document.getElementById("clave");
  const rolSelect = document.getElementById("rol");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Previene el envío tradicional del formulario

    // Elimina errores anteriores
    const existingError = document.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    const nombre = nombreInput.value.trim();
    const clave = claveInput.value.trim();
    const rol = rolSelect.value;

    let mensajeError = "";

    // Validación de nombre
    if (!validarNombre()) {
      mensajeError += "El nombre de usuario es obligatorio.<br>";
    }

    // Validación de contraseña (mínimo 8 caracteres, letras y números)
    if (!validarClave()) {
      mensajeError += "La contraseña debe tener al menos 8 caracteres, incluir letras y números.<br>";
    }

    // Validación de rol
    if (!validarRol()) {
      mensajeError += "Debes seleccionar un rol.";
    }

    if (mensajeError) {
      mostrarError(mensajeError);
    } else {
      // Enviar solicitud de autenticación al servidor
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nombre, clave, rol }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
        
          const redirectUrl = data.redirectTo;
          sessionStorage.removeItem("returnTo");
          window.location.href = redirectUrl;
        }
       else {
          // Si hay error de autenticación, mostrar el mensaje
          mostrarError(data.error);
        }
      } catch (error) {
        mostrarError("Hubo un error al procesar la solicitud.");
      }
    }
  });

  // Función para mostrar los errores
  function mostrarError(mensaje) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.innerHTML = mensaje;
    const form = document.querySelector("form");
    form.insertBefore(errorDiv, form.firstChild);
  }

  // Funciones de validación para cada campo
  function validarNombre() {
    const nombre = nombreInput.value.trim();
    if (nombre === "") {
      mostrarErrorCampo(nombreInput, "El nombre de usuario es obligatorio.");
      return false;
    }
    limpiarErrorCampo(nombreInput);
    return true;
  }

  function validarClave() {
    const clave = claveInput.value.trim();
    const claveRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (clave === "") {
      mostrarErrorCampo(claveInput, "La contraseña es obligatoria.");
      return false;
    } else if (!claveRegex.test(clave)) {
      mostrarErrorCampo(claveInput, "La contraseña debe tener al menos 8 caracteres, incluir letras y números.");
      return false;
    }
    limpiarErrorCampo(claveInput);
    return true;
  }

  function validarRol() {
    const rol = rolSelect.value;
    if (rol === "") {
      mostrarErrorCampo(rolSelect, "Debes seleccionar un rol.");
      return false;
    }
    limpiarErrorCampo(rolSelect);
    return true;
  }

  // Funciones para mostrar o limpiar errores en cada campo
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
    if (errorSpan) {
      errorSpan.remove();
    }
  }
});
