// utils.js
export function obtenerClaseCategoria(categoria) {
    switch (categoria) {
      case 'Entradas': return 'badge badge-entrada';
      case 'Menú': return 'badge badge-menu';
      case 'Combos': return 'badge badge-combo';
      case 'Postres': return 'badge badge-postre';
      case 'Bebidas': return 'badge badge-bebida';
      default: return 'badge badge-default';
    }
  }
  
  export function filtrarProductos() {
    const input = document.getElementById('buscador').value.toLowerCase().trim();
    const filtros = input.split(/\s+/);
    const filas = document.querySelectorAll('#tablaProductos tbody tr');
  
    filas.forEach(fila => {
      const nombre = fila.children[1].textContent.toLowerCase();
      const descripcion = fila.children[2].textContent.toLowerCase();
      const categoria = fila.children[4].textContent.toLowerCase();
      const disponible = fila.children[5].textContent.toLowerCase();
  
      const coincide = filtros.every(palabra =>
        nombre.includes(palabra) ||
        descripcion.includes(palabra) ||
        categoria.includes(palabra) ||
        disponible.includes(palabra)
      );
  
      fila.style.display = coincide ? '' : 'none';
    });
  }
  