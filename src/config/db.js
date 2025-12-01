const pg = require('pg');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

const database = new pg.Pool(dbConfig);

database.on('connect', () => {
    console.log('>>> DB Conectada: Sparky está en línea');
});

module.exports = database;