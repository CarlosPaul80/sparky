const db = require('../config/db'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (request, response) => {
    try {
        const { username, password, role } = request.body;
        const userQuery = 'SELECT * FROM users WHERE username = $1';
        const foundUser = await db.query(userQuery, [username]);

        if (foundUser.rowCount > 0) {
            return response.status(400).json({ 
                message: 'Error: El nombre de usuario ya está en uso.' 
            });
        }

        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        const userRole = role ? role : 'usuario';
        
        const insertQuery = `
            INSERT INTO users (username, password, role) 
            VALUES ($1, $2, $3) 
            RETURNING id, username, role
        `;
        
        const createdUser = await db.query(insertQuery, [username, hash, userRole]);

        return response.status(201).json({
            message: 'Registro completado con éxito',
            user: createdUser.rows[0]
        });

    } catch (err) {
        console.error('Error en register:', err);
        return response.status(500).json({ message: 'Fallo interno del servidor' });
    }
};

const login = async (request, response) => {
    try {
        const { username, password } = request.body;

        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await db.query(query, [username]);

        if (result.rows.length === 0) {
            return response.status(400).json({ message: 'Acceso denegado: Datos incorrectos' });
        }

        const userData = result.rows[0];

        const validPassword = await bcrypt.compare(password, userData.password);
        
        if (!validPassword) {
        
            return response.status(400).json({ message: 'Acceso denegado: Datos incorrectos' });
        }

        const tokenPayload = { 
            id: userData.id, 
            role: userData.role 
        };
        
        const webToken = jwt.sign(
            tokenPayload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        return response.json({
            message: 'Bienvenido al sistema',
            token: webToken,
            role: userData.role
        });

    } catch (err) {
        console.error('Error en login:', err);
        return response.status(500).json({ message: 'No se pudo iniciar sesión' });
    }
};

module.exports = { register, login };