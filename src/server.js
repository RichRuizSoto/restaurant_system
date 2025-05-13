const app = require('./app');
const http = require('http');
const { setupSocket } = require('./utils/socket');

const PORT = process.env.PORT;
const server = http.createServer(app);

setupSocket(server, app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
