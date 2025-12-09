const pg = require('pg');
require('dotenv').config();

// MIRA AQUI: Esto le dice al codigo: "Si existe una URL de Railway, usala. Si no, usa mis datos locales"
const connectionString = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL 
    : `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const database = new pg.Pool({
    connectionString: connectionString,
    // IMPORTANTE: Railway necesita SSL (seguridad), tu compu no. Esto lo arregla automatico.
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

database.on('connect', () => {
    console.log('>>> DB Conectada: Sparky está en línea ⚡');
});

database.on('error', (err) => {
    console.error('>>> Error en la base de datos:', err);
});

module.exports = database;