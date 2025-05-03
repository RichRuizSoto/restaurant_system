export async function obtenerEstablecimientos() {
    const res = await fetch('/api/gestor/establecimientos');
    if (!res.ok) throw new Error('Error al obtener establecimientos');
    return res.json();
  }
  
  export async function crearEstablecimiento({ nombre, estado }) {
    const res = await fetch('/api/gestor/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, estado })
    });
    return res.json();
  }
  
  export async function actualizarEstablecimiento(id, data) {
    const res = await fetch(`/api/gestor/establecimientos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
  