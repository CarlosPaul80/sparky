const axios = require('axios'); // Asegúrate de tener axios instalado (npm install axios)
// Si no quieres usar axios, avísame para hacerlo con 'fetch' nativo (Node 18+)

// CONFIGURACIÓN: Debe coincidir con tu backend
const API_URL = 'http://localhost:3000/api/solar/log'; 

console.log('--- INICIANDO SIMULADOR DE PANEL SOLAR (SPARKY) ---');
console.log(`📡 Enviando datos a: ${API_URL}`);
console.log('---------------------------------------------------');

// Función para generar números aleatorios (simulación de sensores)
const random = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

const enviarDatos = async () => {
    // 1. Generar datos falsos
    const datos = {
        voltaje: random(11.5, 14.5),      // Voltaje típico de batería 12V
        corriente: random(0.5, 5.0),      // Amperios generados
        temperatura: random(20, 65),      // Temperatura del panel
        bateria_nivel: Math.floor(random(40, 100)) // Porcentaje de batería
    };

    try {
        // 2. Enviar al Backend (POST)
        const response = await axios.post(API_URL, datos);
        
        console.log(`✅ Enviado: ${datos.voltaje}V | ${datos.temperatura}°C -> Respuesta Server:`, response.data);
        
        // Si el servidor nos dice que apaguemos (lógica de alerta)
        if (response.data.orden_apagado) {
            console.warn('⚠️ ALERTA: El servidor ordenó APAGADO DE EMERGENCIA por temperatura.');
        }

    } catch (error) {
        // 3. Manejo de errores (Si el backend está apagado o la URL está mal)
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ ERROR DE CONEXIÓN: El servidor Backend parece estar apagado o en otro puerto.');
        } else {
            console.error(`❌ Error enviando: ${error.message}`);
        }
    }
};

// Enviar datos cada 3 segundos
setInterval(enviarDatos, 3000);
enviarDatos(); // Ejecutar inmediatamente la primera vez