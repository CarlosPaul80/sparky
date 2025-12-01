const { Pool } = require('pg'); // <--- ¡ESTA ES LA LÍNEA QUE TE FALTABA!
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME, // Aquí tomará 'sparky_db' de tu .env
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('Conectado exitosamente a PostgreSQL (Sparky)');
});

module.exports = pool;