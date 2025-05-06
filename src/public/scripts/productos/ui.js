// ui.js
export function mostrarMensaje(msg, tipo = 'success') {
    const container = document.getElementById('toast-container');
  
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    const iconClass = tipo === 'error' ? 'fas fa-times-circle' : 'fas fa-check-circle';
  
    toast.innerHTML = `
      <i class="${iconClass}" style="margin-right: 8px;"></i>
      <span>${msg}</span>
      <button class="close-toast" aria-label="Cerrar notificación">
        <i class="fas fa-times"></i>
      </button>
    `;
  
    toast.querySelector('.close-toast').addEventListener('click', () => toast.remove());
    container.appendChild(toast);
  
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 3000);
  }
  
  export function mostrarNotificacion(mensaje, tipo) {
    const toast = document.createElement('div');
    toast.classList.add('toast', tipo);
  
    const contenido = document.createElement('span');
    contenido.textContent = mensaje;
  
    const closeButton = document.createElement('button');
    closeButton.classList.add('close-toast');
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => toast.remove();
  
    toast.appendChild(contenido);
    toast.appendChild(closeButton);
  
    const toastContainer = document.getElementById('toast-container');
    toastContainer.appendChild(toast);
  
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
  