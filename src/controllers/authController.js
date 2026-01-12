const pool = require('../config/db'); // ✅ Importamos como 'pool'
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (request, response) => {
    try {
        // Recibimos nombre y email del Frontend (Angular)
        const { nombre, email, password } = request.body;
        
        // 1. Verificar si el email ya existe en la tabla 'usuarios'
        const userQuery = 'SELECT * FROM usuarios WHERE email = $1';
        // CORREGIDO: Usamos pool.query en vez de db.query
        const foundUser = await pool.query(userQuery, [email]);

        if (foundUser.rowCount > 0) {
            return response.status(400).json({ 
                message: 'Error: El correo electrónico ya está registrado.' 
            });
        }

        // 2. Encriptar contraseña
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        // 3. Insertar en la base de datos
        // Usamos la columna 'rol' (español) y 'nombre'
        const insertQuery = `
            INSERT INTO usuarios (nombre, email, password, rol) 
            VALUES ($1, $2, $3, 'usuario') 
            RETURNING id, nombre, email, rol
        `;
        
        // CORREGIDO: Usamos pool.query
        const createdUser = await pool.query(insertQuery, [nombre, email, hash]);

        return response.status(201).json({
            message: 'Registro completado con éxito',
            user: createdUser.rows[0]
        });

    } catch (err) {
        console.error('Error en register:', err);
        return response.status(500).json({ message: 'Fallo interno del servidor al registrar' });
    }
};

const login = async (request, response) => {
    try {
        // El frontend envía 'email' y 'password'
        const { email, password } = request.body;

        // 1. Buscar usuario por email en tabla 'usuarios'
        const query = 'SELECT * FROM usuarios WHERE email = $1';
        // CORREGIDO: Usamos pool.query
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return response.status(400).json({ message: 'Datos incorrectos' });
        }

        const userData = result.rows[0];

        // 2. Comparar contraseñas
        const validPassword = await bcrypt.compare(password, userData.password);
        
        if (!validPassword) {
            return response.status(400).json({ message: 'Datos incorrectos' });
        }

        // 3. Crear Token
        const tokenPayload = { 
            id: userData.id, 
            rol: userData.rol // Usamos 'rol' de la DB
        };
        
        const webToken = jwt.sign(
            tokenPayload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // 4. Responder al Frontend
        return response.json({
            message: 'Bienvenido al sistema',
            token: webToken,
            user: {
                id: userData.id,
                nombre: userData.nombre,
                email: userData.email,
                rol: userData.rol // Angular necesita esto
            }
        });

    } catch (err) {
        console.error('Error en login:', err);
        return response.status(500).json({ message: 'No se pudo iniciar sesión' });
    }
};

module.exports = { register, login };