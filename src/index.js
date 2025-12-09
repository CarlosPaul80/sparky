const express = require('express');
const cors = require('cors'); // <--- IMPORTANTE: Importar cors
require('dotenv').config();
// Importa tus rutas (asegúrate que la ruta sea correcta según tu carpeta)
const authRoutes = require('./routes/authRoutes'); 

const app = express();

// 1. HABILITAR CORS: Esto permite que el Frontend hable con el Backend
app.use(cors()); 

app.use(express.json());

// Tus rutas
app.use('/api/auth', authRoutes); // O la ruta que estés usando

// 2. PUERTO DINÁMICO: Railway te asigna un puerto al azar en process.env.PORT
const PORT = process.env.PORT || 3000; 

app.listen(PORT, '0.0.0.0', () => { // '0.0.0.0' es necesario para Docker/Railway
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});