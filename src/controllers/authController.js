const jwt = require('jsonwebtoken');
const { db, hashPassword, comparePassword } = require('../database');
const config = require('../config');

exports.registerPage = (req, res) => {
    res.render('register');
};

// Функция для регистрации нового пользователя
exports.register = (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = hashPassword(password);
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
        if (err) {
            res.status(500).send('Error registering new user');
        } else {
            // res.status(200).send('User registered successfully');
            res.redirect('/login');
        }
    });
};

exports.loginPage = (req, res) => {
    res.render('login');
};

// Функция для аутентификации пользователя
exports.login = (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => { // Используем db.get для получения одного пользователя
        if (err) {
            res.status(500).send('Error when receiving user data');
        } else if (user) {
            const isValidPassword = comparePassword(password, user.password);
            if (!isValidPassword) return res.status(401).send('Invalid credentials');

            // Генерация JWT токена
            const token = jwt.sign({ id: user.id, email: user.email }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

            // Сохранение токена в куки
            res.cookie('token', token, { httpOnly: true, secure: config.NODE_ENV === 'production' });
            // res.status(200).send('Login successful');
            res.redirect('/home');
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
};

// Функция для выхода из системы
exports.logout = (req, res) => {
    res.clearCookie('token');
    // res.status(200).json({ message: 'Logout successful' });
    res.redirect('/login');
};