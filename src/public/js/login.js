document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      email: form.email.value,
      password: form.password.value
    };
  
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  
    const result = await res.json();
    if (res.ok) {
      // Redirigir al panel de administración o página de inicio
      window.location.href = '/admin';
    } else {
      alert(result.mensaje || 'Error al iniciar sesión');
    }
  });
  