const { db } = require('../database');
const i18n = require('i18n');

exports.startPage = (req, res) => {
    res.render('startPage');
};

exports.termsPage = (req, res) => {
    res.render('termsOfUse');
};

exports.settingsPage = (req, res) => {
    res.render('settings', { user: req.user, colors: [
        { color: '#52c8e5', bgColor: '#368598' },
        { color: '#8a5bdc', bgColor: '#5a3b8f' },
        { color: '#ff6ac6', bgColor: '#b24a8a' },
        { color: '#e55268', bgColor: '#983645' },
        { color: '#e57c52', bgColor: '#985236' },
        { color: '#efd648', bgColor: '#a29130' },
        { color: '#7cdb5c', bgColor: '#508e3b' }
    ] });
}

exports.getSettings = (req, res) => {
    db.get('SELECT theme, color, bg_color, beta, cal_months FROM users WHERE id = ?', [req.user.id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при получении настроек' });
        }

        res.json(row);
    });
};

exports.getHashtags = (req, res) => {
    db.all('SELECT tags FROM entries WHERE user_id = ?', [req.user.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при получении хэштегов' });
        }

        const hashtags = [];
        rows.forEach(row => {
            if (row.tags) {
                row.tags.split(',').forEach(tag => {
                    if (tag) {
                        hashtags.push(tag);
                    }
                });
            }
        });

        const hashtagCounts = {};
        hashtags.forEach(hashtag => {
            if (hashtagCounts[hashtag]) {
                hashtagCounts[hashtag]++;
            } else {
                hashtagCounts[hashtag] = 1;
            }
        });

        const sortedHashtags = Object.keys(hashtagCounts).sort((a, b) => hashtagCounts[b] - hashtagCounts[a]);

        res.json(sortedHashtags);
    });
};

exports.updateSettings = (req, res) => {
    const { theme, color, bg_color, lang, beta, cal_months, rec_ent } = req.body;
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
    if (cal_months) {
        fields.push('cal_months = ?');
        params.push(cal_months);
    }
    if (rec_ent !== undefined && 0 <= Number(rec_ent) <= 10) {
        fields.push('rec_ent = ?');
        params.push(rec_ent);
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