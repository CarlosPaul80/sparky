require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/authRoutes');

// Inicializar aplicación
const server = express();

// Configuraciones globales
server.use(express.json()); // Habilitar lectura de JSON
server.use(cors());         // Habilitar CORS

// Rutas principales
server.use('/api/auth', authRoutes);

// Arranque del servidor
const SERVER_PORT = process.env.PORT || 3000;

server.listen(SERVER_PORT, () => {
    console.log(`--- Servidor Sparky activo en puerto: ${SERVER_PORT} ---`);
});