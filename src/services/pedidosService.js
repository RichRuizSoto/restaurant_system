const db = require('../core/config/database');
const socket = require('../utils/socket'); // Asegúrate de importar el socket

// Crear un nuevo pedido
exports.crearPedido = async (pedido) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Validación mínima
    if (
      !pedido.id_restaurante ||
      !pedido.productos ||
      !Array.isArray(pedido.productos) ||
      pedido.productos.length === 0
    ) {
      throw new Error('Pedido inválido: faltan datos requeridos');
    }

    let numeroOrden;
    let insertado = false;
    let intentos = 0;
    let pedidoId;

    // Reintentos en caso de colisión por duplicado
    while (!insertado && intentos < 5) {
      intentos++;

      const [ultimo] = await conn.query(
        `SELECT MAX(numero_orden) AS max
         FROM pedidos
         WHERE id_restaurante = ?
           AND DATE(creado_en) = CURDATE()`,
        [pedido.id_restaurante]
      );

      numeroOrden = (ultimo[0].max || 0) + 1;

      try {
        const [result] = await conn.query(
          `INSERT INTO pedidos 
           (id_restaurante, numero_orden, mesa, total, estado, creado_en, tipo_servicio, nombre, telefono, direccion)
           VALUES (?, ?, ?, ?, 'solicitado', NOW(), ?, ?, ?, ?)`,
          [
            pedido.id_restaurante,
            numeroOrden,
            pedido.mesa || 0,
            pedido.total,
            pedido.tipo_servicio,
            pedido.nombre || null,
            pedido.telefono || null,
            pedido.direccion || null
          ]
        );

        pedidoId = result.insertId;
        insertado = true;

        await conn.query(`
          INSERT INTO tiempo_promedio_pedido (id_restaurante, id_pedido)
          VALUES (?, ?)`,
          [pedido.id_restaurante, pedidoId]
        );

      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') throw err;
        // Si es duplicado, intentar de nuevo
      }
    }

    if (!insertado) {
      throw new Error('No se pudo generar un número de orden único después de varios intentos');
    }

    // Insertar productos en detalle_pedido
    for (const producto of pedido.productos) {
      if (
        !producto.id_producto ||
        typeof producto.cantidad !== 'number' ||
        typeof producto.precio !== 'number'
      ) {
        throw new Error('Datos de producto inválidos');
      }

      await conn.query(
        `INSERT INTO detalle_pedido 
         (id_pedido, id_producto, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [
          pedidoId,
          producto.id_producto,
          producto.cantidad,
          producto.precio
        ]
      );
    }

    await conn.commit();

    // Obtener el pedido completo
    const pedidoCompleto = await exports.obtenerPedidoPorId(pedidoId);

    // Emitir el evento WebSocket a los clientes del restaurante
    const io = socket.getSocket();
    io.to(`restaurante_${pedido.id_restaurante}`).emit('nuevoPedido', pedidoCompleto);

    return pedidoCompleto;

  } catch (err) {
    await conn.rollback();
    console.error('❌ [Error en crearPedido]', err);
    throw new Error('Error al procesar el pedido: ' + err.message);
  } finally {
    conn.release();
  }
};





// Obtener un pedido por número de orden
exports.obtenerPedidoPorNumero = async (numeroOrden) => {
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      `SELECT p.*, dp.id_producto, dp.cantidad, dp.precio_unitario, pr.nombre_producto
       FROM pedidos p
       JOIN detalle_pedido dp ON p.id = dp.id_pedido
       JOIN productos pr ON dp.id_producto = pr.id
       WHERE p.numero_orden = ?`,
      [numeroOrden]
    );

    if (result.length === 0) return null;

    const pedido = {
      id: result[0].id,
      numero_orden: result[0].numero_orden,
      mesa: result[0].mesa,
      total: result[0].total,
      estado: result[0].estado,
      creado_en: result[0].creado_en,
      productos: result.map(row => ({
        id_producto: row.id_producto,
        cantidad: row.cantidad,
        precio_unitario: parseFloat(row.precio_unitario),
        nombre: row.nombre_producto
      }))
    };

    return pedido;
  } finally {
    conn.release();
  }
};


// Obtener un pedido por ID
exports.obtenerPedidoPorId = async (idPedido) => {
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      `SELECT 
         p.id, p.numero_orden, p.mesa, p.total, p.estado, p.creado_en, 
         p.tipo_servicio, p.nombre, p.telefono, p.direccion, -- 🟢 NUEVOS CAMPOS
         dp.id_producto, dp.cantidad, dp.precio_unitario, pr.nombre_producto
       FROM pedidos p
       JOIN detalle_pedido dp ON p.id = dp.id_pedido
       JOIN productos pr ON dp.id_producto = pr.id
       WHERE p.id = ?`,
      [idPedido]
    );

    if (result.length === 0) return null;

    const pedido = {
      id: result[0].id,
      numero_orden: result[0].numero_orden,
      mesa: result[0].mesa,
      total: result[0].total,
      estado: result[0].estado,
      creado_en: result[0].creado_en,
      tipo_servicio: result[0].tipo_servicio,
      nombre: result[0].nombre,           // 🟢
      telefono: result[0].telefono,       // 🟢
      direccion: result[0].direccion,     // 🟢
      productos: result.map(row => ({
        id_producto: row.id_producto,
        cantidad: row.cantidad,
        precio_unitario: parseFloat(row.precio_unitario),
        nombre: row.nombre_producto
      }))
    };

    return pedido;
  } finally {
    conn.release();
  }
};



// Obtener todos los pedidos con detalles para un restaurante
exports.obtenerPedidosPorRestaurante = async (restId) => {
  const [rows] = await db.query(`
    SELECT p.*, dp.id_producto, dp.cantidad, dp.precio_unitario, pr.nombre_producto, p.tipo_servicio
    FROM pedidos p
    JOIN detalle_pedido dp ON p.id = dp.id_pedido
    JOIN productos pr ON dp.id_producto = pr.id
    WHERE p.id_restaurante = ?
  `, [restId]);

  // Agrupar productos por pedido
  const pedidosMap = {};

  rows.forEach(row => {
    if (!pedidosMap[row.id]) {
      pedidosMap[row.id] = {
        id: row.id,
        numero_orden: row.numero_orden,
        mesa: row.mesa,
        total: row.total,
        estado: row.estado,
        creado_en: row.creado_en,
        productos: [],
        tipo_servicio: row.tipo_servicio
      };
    }

    pedidosMap[row.id].productos.push({
      id: row.id_producto,
      nombre: row.nombre_producto,
      cantidad: row.cantidad,
      precio_unitario: row.precio_unitario
    });
  });

  return Object.values(pedidosMap);
};

// Actualizar estado de un pedido y devolver con productos
exports.cambiarEstadoPedido = async (idPedido, nuevoEstado) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Actualizar el estado
    await conn.query('UPDATE pedidos SET estado = ? WHERE id = ?', [nuevoEstado, idPedido]);

    const [[{ id_restaurante: restauranteId }]] = await conn.query(
      'SELECT id_restaurante FROM pedidos WHERE id = ?',
      [idPedido]
    );

    // Actualizar tiempos en tiempo_promedio_pedido
    if (nuevoEstado === 'listo') {
      await conn.query(`
        UPDATE tiempo_promedio_pedido
        SET 
          hora_listo = NOW(),
          duracion_solicitado_listo = TIMESTAMPDIFF(MINUTE, hora_solicitado, NOW())
        WHERE id_pedido = ?`, [idPedido]);

      const io = socket.getSocket();
      io.to(`sala_${restauranteId}_${idPedido}`).emit('nuevoEstadoPedido', 'listo');
    }

    if (nuevoEstado === 'pagado') {
      await conn.query(`
        UPDATE tiempo_promedio_pedido
        SET 
          hora_pagado = NOW(),
          duracion_listo_pagado = TIMESTAMPDIFF(MINUTE, hora_listo, NOW()),
          duracion_solicitado_pagado = TIMESTAMPDIFF(MINUTE, hora_solicitado, NOW())
        WHERE id_pedido = ?`, [idPedido]);
    }

    // Obtener el pedido actualizado
    const [rows] = await conn.query('SELECT * FROM pedidos WHERE id = ?', [idPedido]);
    const pedido = rows[0];

    if (!pedido) {
      await conn.rollback();
      return null;
    }

    // Obtener los productos asociados al pedido
    const [productos] = await conn.query(`
      SELECT dp.id_producto, dp.cantidad, dp.precio_unitario, pr.nombre_producto
      FROM detalle_pedido dp
      JOIN productos pr ON dp.id_producto = pr.id
      WHERE dp.id_pedido = ?`, [idPedido]);

    pedido.productos = productos.map(p => ({
      id_producto: p.id_producto,
      cantidad: p.cantidad,
      precio_unitario: p.precio_unitario,
      nombre: p.nombre_producto || `Producto ${p.id_producto}`
    }));

    await conn.commit();
    return pedido;

  } catch (err) {
    await conn.rollback();
    console.error('❌ [Error en cambiarEstadoPedido]', err);
    throw err;
  } finally {
    conn.release();
  }
};


// Obtener los productos de un pedido específico por ID
exports.obtenerProductosPorPedido = async (idPedido) => {
  const [productos] = await db.query(`
    SELECT dp.id_producto, dp.cantidad, dp.precio_unitario, pr.nombre_producto
    FROM detalle_pedido dp
    JOIN productos pr ON dp.id_producto = pr.id
    WHERE dp.id_pedido = ?
  `, [idPedido]);

  return productos.map(p => ({
    id_producto: p.id_producto,
    cantidad: p.cantidad,
    precio_unitario: parseFloat(p.precio_unitario),
    nombre: p.nombre_producto
  }));
};


exports.obtenerPromedioUltimos10 = async (idRestaurante) => {
  const [rows] = await db.query(`
    SELECT duracion_solicitado_listo 
    FROM tiempo_promedio_pedido 
    WHERE id_restaurante = ? 
      AND duracion_solicitado_listo IS NOT NULL 
    ORDER BY hora_listo DESC 
    LIMIT 10
  `, [idRestaurante]);

  if (!rows.length) return null;

  const total = rows.reduce((acc, row) => acc + row.duracion_solicitado_listo, 0);
  const promedio = total / rows.length;

  return promedio;
};

// 📅 Obtener cantidad de pedidos de hoy para un restaurante
exports.obtenerCantidadPedidosHoy = async (restId) => {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS cantidad
    FROM pedidos
    WHERE id_restaurante = ? AND DATE(creado_en) = CURDATE()
  `, [restId]);

  return rows[0].cantidad;
};

exports.obtenerUltimosPedidos = async (idRestaurante) => {
  const [result] = await db.query(`
    SELECT numero_orden, nombre, total, estado, creado_en
    FROM pedidos
    WHERE id_restaurante = ?
    ORDER BY creado_en DESC
    LIMIT 10
  `, [idRestaurante]);

  return result;
};
