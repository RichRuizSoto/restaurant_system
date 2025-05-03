export function mostrarToast(mensaje, tipo = 'success') {
    const toastEl = document.getElementById('toastNotificacion');
    const toastMensaje = document.getElementById('toastMensaje');
  
    const iconos = {
      success: '<i class="fas fa-check-circle"></i>',
      danger: '<i class="fas fa-times-circle"></i>',
      warning: '<i class="fas fa-exclamation-circle"></i>',
      info: '<i class="fas fa-info-circle"></i>'
    };
  
    toastEl.className = `toast align-items-center text-bg-${tipo} border-0`;
    toastMensaje.innerHTML = `${iconos[tipo] || ''} ${mensaje}`;
  
    new bootstrap.Toast(toastEl, { delay: 3000, autohide: true }).show();
  }
  