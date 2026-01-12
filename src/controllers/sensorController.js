// 1. IMPORTAR LA BASE DE DATOS (Ruta corregida)
const pool = require('../config/db'); 

// 2. FUNCIÓN: Guardar datos (logSolarData)
const logSolarData = async (req, res) => {
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
};

// 3. FUNCIÓN: Obtener último dato (getLatestData)
const getLatestData = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM mediciones ORDER BY fecha_registro DESC LIMIT 1');
        res.json(result.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. FUNCIÓN: Obtener historial (getHistory)
const getHistory = async (req, res) => {
    try {
        // Traemos los últimos 20 registros
        const result = await pool.query('SELECT * FROM mediciones ORDER BY fecha_registro DESC LIMIT 20');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- IMPORTANTE: EXPORTAR LAS FUNCIONES ---
// Si falta esto, index.js no puede verlas y da el error "handler must be a function"
module.exports = {
    logSolarData,
    getLatestData,
    getHistory
};