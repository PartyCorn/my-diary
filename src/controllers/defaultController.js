const { db } = require('../database');
const i18n = require('i18n');

exports.startPage = (req, res) => {
    res.render('startPage');
};

exports.settingsPage = (req, res) => {
    res.render('settings', { user: req.user });
}

exports.getSettings = (req, res) => {
    db.get('SELECT theme, color, bg_color, beta, start_date FROM users WHERE id = ?', [req.user.id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при получении настроек' });
        }

        res.json(row);
    });
};

exports.updateSettings = (req, res) => {
    const { theme, color, bg_color, lang, beta, start_date } = req.body;
    const userId = req.user.id;

    // Массив для хранения частей SQL-запроса
    const fields = [];
    const params = [];

    // Проверяем каждую переменную, если она не undefined, добавляем её в запрос
    if (theme !== undefined) {
        fields.push('theme = ?');
        params.push(theme);
    }
    if (color) {
        fields.push('color = ?');
        params.push(color);
    }
    if (bg_color) {
        fields.push('bg_color = ?');
        params.push(bg_color);
    }
    if (lang) {
        fields.push('lang = ?');
        params.push(lang);
    }
    if (beta !== undefined) {
        fields.push('beta = ?');
        params.push(beta);
    }
    if (start_date) {
        fields.push('start_date = ?');
        params.push(start_date);
    }

    // Если нет полей для обновления, возвращаем ошибку
    if (fields.length === 0) {
        return res.status(400).json({ message: 'Нет данных для обновления' });
    }

    // Добавляем ID пользователя в конец параметров
    params.push(userId);

    // Формируем окончательный SQL-запрос
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    db.run(query, params, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при обновлении настроек' });
        }

        // Обновляем язык, если он был передан и обновлен
        if (lang !== undefined) {
            i18n.setLocale(req, lang);
        }

        res.json({ message: 'Настройки успешно обновлены!' });
    });
};