require('dotenv').config(); // Asegúrate de ejecutar node desde la raíz del proyecto
const express = require('express');
const cors = require('cors');

// --- IMPORTACIONES ---
const pool = require('./config/db'); 
const sensorController = require('./controllers/sensorController');
const authController = require('./controllers/authController');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- VERIFICACIÓN DE TABLAS ---
const initDB = async () => {
    try {
        // Tabla de Mediciones
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
        
        // Tabla de Usuarios
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                password VARCHAR(255),
                rol VARCHAR(20) DEFAULT 'usuario'
            );
        `);
        console.log('✅ Tablas verificadas correctamente en la DB.');
    } catch (err) {
        console.error('❌ Error inicializando Tablas:', err);
    }
};

// Ejecutamos la verificación
initDB();

// ==========================================
//           RUTAS DE LA APLICACIÓN
// ==========================================

// --- 1. RUTAS DE AUTENTICACIÓN ---
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);


// --- 2. GESTIÓN DE USUARIOS (ADMIN) ---  // <--- NUEVO BLOQUE
// Obtener todos los usuarios
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nombre, email, rol FROM usuarios');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// Cambiar rol de usuario
app.put('/api/users/:id/role', async (req, res) => {
    const { role } = req.body;
    const { id } = req.params;
    try {
        await pool.query('UPDATE usuarios SET rol = $1 WHERE id = $2', [role, id]);
        res.json({ message: 'Rol actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar rol' });
    }
});

// Eliminar usuario
app.delete('/api/users/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});


// --- 3. RUTAS DEL SISTEMA SOLAR ---
app.post('/api/solar/log', sensorController.logSolarData);
app.get('/api/solar/latest', sensorController.getLatestData);
app.get('/api/solar/history', sensorController.getHistory);

// --- 4. COMANDOS PARA EL ESP32 --- // <--- NUEVO BLOQUE
// Variable en memoria para guardar el comando pendiente
let comandoPendiente = null; 

// Endpoint para que el Frontend envíe la orden (ej: 'RESTART')
app.post('/api/solar/command', (req, res) => {
    comandoPendiente = req.body.command; 
    console.log("📡 Comando recibido para ESP32:", comandoPendiente);
    res.json({ status: 'queued', command: comandoPendiente });
});

// (OPCIONAL) Endpoint para que el ESP32 pregunte si hay comandos
// El ESP32 debería llamar a esto periódicamente
app.get('/api/solar/command', (req, res) => {
    if (comandoPendiente) {
        res.json({ command: comandoPendiente });
        console.log("🚀 Comando enviado al ESP32:", comandoPendiente);
        comandoPendiente = null; // Limpiamos el comando tras enviarlo
    } else {
        res.json({ command: null });
    }
});


// --- INICIAR SERVIDOR ---
app.listen(port, () => {
    console.log(`⚡ Servidor Backend corriendo en http://localhost:${port}`);
});