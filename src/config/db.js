const pg = require('pg');
require('dotenv').config();

// Lógica: Si estamos en Railway (DATABASE_URL existe), usa eso.
// Si estamos en tu PC, construye la URL con tus variables del .env
const isProduction = !!process.env.DATABASE_URL;

const connectionString = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL 
    : `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const database = new pg.Pool({
    connectionString: connectionString,
    // Railway EXIGE conexión segura (SSL), pero en tu PC (localhost) da error si lo activas.
    // Esta línea lo activa solo si hay una DATABASE_URL (es decir, en Railway).
    ssl: isProduction ? { rejectUnauthorized: false } : false
});

database.on('connect', () => {
    console.log('>>> DB Conectada: Sparky está en línea ⚡');
});

module.exports = database;