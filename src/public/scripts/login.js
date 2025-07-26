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

    let mensajeError = "";

    if (!validarNombre()) mensajeError += "El nombre de usuario es obligatorio.<br>";
    if (!validarClave()) mensajeError += "La contraseña debe tener al menos 8 caracteres, incluir letras y números.<br>";
    if (!validarRol()) mensajeError += "Debes seleccionar un rol.";

    if (mensajeError) {
      mostrarError(mensajeError);
      return;
    }

    if (!storedReturnTo) {
      mostrarError("No hay una ruta de retorno válida. Intenta ingresar desde una página protegida.");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ nombre, clave, rol, returnTo: storedReturnTo }),
      });

      const data = await response.json();

      console.log("🔁 Redireccionando a:", data.redirectUrl);

      if (response.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        let mensaje = data.error || "Error al iniciar sesión.";

        if (mensaje === "Acceso denegado para este rol") {
          mensaje = "No tienes permisos suficientes con el rol seleccionado.";
        }

        mostrarError(mensaje);
      }

    } catch (error) {
      mostrarError("Hubo un error al procesar la solicitud.");
      console.error(error);
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
