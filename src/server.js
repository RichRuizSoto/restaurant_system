const app = require('./app');
const http = require('http');
const { setupSocket } = require('./utils/socket'); // WebSocket

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Configurar WebSocket con el servidor
setupSocket(server, app);

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
