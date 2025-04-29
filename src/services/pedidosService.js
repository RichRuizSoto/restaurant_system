const db = require('../core/config/database');

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
            (id_restaurante, numero_orden, mesa, total, estado, creado_en)
           VALUES (?, ?, ?, ?, 'solicitado', NOW())`,
          [
            pedido.id_restaurante,
            numeroOrden,
            pedido.mesa || 1,
            pedido.total
          ]
        );

        pedidoId = result.insertId;
        insertado = true;

      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') {
          throw err; // Otro error inesperado
        }
        // Duplicado de numero_orden, reintenta
      }
    }

    if (!insertado) {
      throw new Error('No se pudo generar un número de orden único después de varios intentos');
    }

    // Insertar productos en 'detalle_pedido'
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

    return {
      numero_orden: numeroOrden,
      total: pedido.total,
      pedidoId,
      productos: pedido.productos
    };

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
      `SELECT p.*, dp.id_producto, dp.cantidad, dp.precio_unitario
       FROM pedidos p
       JOIN detalle_pedido dp ON p.id = dp.id_pedido
       WHERE p.numero_orden = ?`,
      [numeroOrden]
    );

    // Si no se encuentra el pedido
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
        precio: row.precio_unitario
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
      `SELECT p.*, dp.id_producto, dp.cantidad, dp.precio_unitario
       FROM pedidos p
       JOIN detalle_pedido dp ON p.id = dp.id_pedido
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
      productos: result.map(row => ({
        id_producto: row.id_producto,
        cantidad: row.cantidad,
        precio: row.precio_unitario
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
    SELECT p.*, dp.id_producto, dp.cantidad, dp.precio_unitario, pr.nombre_producto
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
        productos: []
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
  // Actualizar el estado
  await db.query('UPDATE pedidos SET estado = ? WHERE id = ?', [nuevoEstado, idPedido]);

  // Obtener el pedido actualizado
  const [rows] = await db.query('SELECT * FROM pedidos WHERE id = ?', [idPedido]);
  const pedido = rows[0];

  if (!pedido) return null;

  // Obtener los productos asociados al pedido
  const [productos] = await db.query(`
    SELECT dp.id_producto, dp.cantidad, dp.precio_unitario, pr.nombre_producto
    FROM detalle_pedido dp
    JOIN productos pr ON dp.id_producto = pr.id
    WHERE dp.id_pedido = ?
  `, [idPedido]);

  pedido.productos = productos.map(p => ({
    id_producto: p.id_producto,
    cantidad: p.cantidad,
    precio_unitario: p.precio_unitario,
    nombre: p.nombre_producto
  }));

  return pedido;
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
    precio_unitario: p.precio_unitario,
    nombre: p.nombre_producto
  }));
};