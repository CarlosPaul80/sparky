const pg = require('pg');
require('dotenv').config();

// MIRA ESTO: Aquí le decimos que si existe la variable de Railway, la use.
// Si no existe, usa las tuyas locales.
const connectionString = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL 
    : `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const database = new pg.Pool({
    connectionString: connectionString,
    // CRUCIAL: Railway exige conexión segura (SSL), tu PC no. Esto lo arregla.
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

database.on('connect', () => {
    console.log('>>> DB Conectada: Sparky está en línea ⚡');
});

database.on('error', (err) => {
    console.error('>>> Error en la base de datos:', err);
});

module.exports = database;