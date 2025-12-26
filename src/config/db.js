const pg = require('pg');
require('dotenv').config();

// Si el host es localhost, no usa SSL. Si es Railway, SÍ usa SSL.
const isProduction = process.env.DB_HOST !== 'localhost';

const database = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: isProduction ? { rejectUnauthorized: false } : false
});

database.on('connect', () => {
    console.log('>>> DB Conectada: Sparky está en línea ⚡');
});

database.on('error', (err) => {
    console.error('>>> Error CRITICO en DB:', err);
});

module.exports = database;