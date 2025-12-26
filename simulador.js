// simulador.js
// Este script finge ser el ESP32
const API_URL = 'http://localhost:3000/api/solar/log';

console.log('📡 INICIANDO SIMULADOR DE PANEL SOLAR S.P.A.R.K.Y...');
console.log('Presiona Ctrl + C para detenerlo.');

async function enviarDato() {
    // Generamos datos aleatorios realistas
    const voltaje = (11.5 + Math.random() * 2.5).toFixed(2); // Entre 11.5V y 14.0V
    const corriente = (0.5 + Math.random() * 3.0).toFixed(2); // Entre 0.5A y 3.5A
    const temperatura = (25 + Math.random() * 15).toFixed(2); // Entre 25°C y 40°C (A veces alerta)
    
    // Lógica simple de batería basada en voltaje
    let bateria = Math.floor(((voltaje - 11.5) / 2.5) * 100);
    if(bateria > 100) bateria = 100;
    if(bateria < 0) bateria = 0;

    const datos = {
        voltaje: parseFloat(voltaje),
        corriente: parseFloat(corriente),
        temperatura: parseFloat(temperatura),
        bateria_nivel: bateria
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const json = await response.json();
        
        console.log(`[Enviado] ${voltaje}V | ${temperatura}°C | Bat: ${bateria}% -> Respuesta:`, json);
        
        if(json.orden_apagado) {
            console.log("⚠️ ALERTA: EL SERVIDOR ORDENA APAGAR EL SISTEMA POR TEMPERATURA ⚠️");
        }

    } catch (error) {
        console.error('Error conectando con el servidor:', error.message);
    }
}

// Enviar un dato cada 3 segundos
setInterval(enviarDato, 3000);