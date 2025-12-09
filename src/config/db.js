const pg = require('pg');
require('dotenv').config();

// ESTA ES LA CLAVE: 
// Detectamos si existe la variable DATABASE_URL (Railway)
const connectionString = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL 
    : `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const database = new pg.Pool({
    connectionString: connectionString,
    // Railway EXIGE esto (SSL), si no lo pones, rechaza la conexión
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

database.on('connect', () => {
    console.log('>>> DB Conectada: Sparky está en línea ⚡');
});

database.on('error', (err) => {
    console.error('>>> Error CRITICO en DB:', err);
});

module.exports = database;