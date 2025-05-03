export function configurarBuscador(inputElement, listaOriginal, onFiltrar) {
    inputElement.addEventListener('input', () => {
      const texto = inputElement.value.toLowerCase();
      const filtrados = listaOriginal.filter(e =>
        e.nombre.toLowerCase().includes(texto)
      );
      onFiltrar(filtrados);
    });
  }
  