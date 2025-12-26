require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Configuración de la Base de Datos (Railway)
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false } // Necesario para Railway
});

// 2. Inicializar la tabla automáticamente (para evitar errores)
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mediciones (
                id SERIAL PRIMARY KEY,
                voltaje DECIMAL(5,2),
                corriente DECIMAL(5,2),
                temperatura DECIMAL(5,2),
                bateria_nivel INTEGER,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Tabla "mediciones" verificada/creada en Railway.');
        
        // Tabla de usuarios (opcional, para el login)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                password VARCHAR(255),
                role VARCHAR(20) DEFAULT 'user'
            );
        `);
    } catch (err) {
        console.error('❌ Error inicializando DB:', err);
    }
};
initDB();

// --- RUTAS DE AUTENTICACIÓN (Login básico) ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    // NOTA: Para pruebas rápidas, si el usuario no existe, puedes crear un "dummy login"
    // O implementar el registro real. Aquí simulamos un admin si las credenciales coinciden con un "hardcoded" para emergencias
    // o buscamos en DB.
    
    // Ejemplo simplificado: Buscar en DB
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            // TRUCO: Si no hay usuarios, crea uno al vuelo para que puedas entrar (solo para desarrollo)
            if (email === 'admin@sparky.com' && password === 'admin123') {
               const token = jwt.sign({ id: 1, nombre: 'Admin', role: 'admin' }, process.env.JWT_SECRET);
               return res.json({ token, user: { nombre: 'Admin', role: 'admin' } });
            }
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }
        
        const user = result.rows[0];
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(401).json({ message: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user.id, nombre: user.nombre, role: user.role }, process.env.JWT_SECRET);
        res.json({ token, user: { nombre: user.nombre, role: user.role } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { nombre, email, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO usuarios (nombre, email, password, role) VALUES ($1, $2, $3, $4)', 
            [nombre, email, hash, 'user']);
        res.json({ message: 'Usuario registrado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- RUTAS DEL SISTEMA SOLAR (Lo que necesita tu Dashboard) ---

// A. Recibir datos del ESP32 o Simulador
app.post('/api/solar/log', async (req, res) => {
    const { voltaje, corriente, temperatura, bateria_nivel } = req.body;
    console.log(`📡 Dato recibido: ${voltaje}V, ${temperatura}°C`);

    try {
        await pool.query(
            'INSERT INTO mediciones (voltaje, corriente, temperatura, bateria_nivel) VALUES ($1, $2, $3, $4)',
            [voltaje, corriente, temperatura, bateria_nivel]
        );
        
        // Lógica simple de alerta para devolver al ESP32
        const orden_apagado = temperatura > 50; 
        res.json({ status: 'ok', orden_apagado });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error guardando en DB' });
    }
});

// B. Obtener el dato más reciente (Para las tarjetas)
app.get('/api/solar/latest', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM mediciones ORDER BY fecha_registro DESC LIMIT 1');
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// C. Obtener historial para la gráfica (¡ESTA ES LA RUTA QUE TE FALTABA!)
app.get('/api/solar/history', async (req, res) => {
    try {
        // Traemos los últimos 20 registros
        const result = await pool.query('SELECT * FROM mediciones ORDER BY fecha_registro DESC LIMIT 20');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`⚡ Servidor Backend corriendo en http://localhost:${port}`);
});