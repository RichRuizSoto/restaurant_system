module.exports = (req, res, next) => {
  const { nombre, estado } = req.body;

  // Validar nombre
  if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
    console.log('Nombre inválido o vacío:', nombre); // Log para depurar
    return res.status(400).json({ error: 'El nombre del restaurante es obligatorio.' });
  }

  // Validar estado (si se proporciona)
  const estadosPermitidos = ['activo', 'inactivo', 'desactivo'];
  if (estado && !estadosPermitidos.includes(estado)) {
    console.log('Estado inválido:', estado); // Log para depurar
    return res.status(400).json({
      error: `Estado inválido. Debe ser uno de: ${estadosPermitidos.join(', ')}`
    });
  }

  // Sanitizar y establecer valores por defecto
  req.body.nombre = nombre.trim();
  req.body.estado = estado || 'activo'; // Estado por defecto 'activo'

  console.log('Datos validados:', req.body); // Log para ver los datos después de sanitizar

  next();
};
