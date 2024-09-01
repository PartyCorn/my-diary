const { db } = require('../database');

exports.homePage = (req, res) => {
    // Получаем все даты, на которые есть записи для текущего пользователя
    db.all('SELECT date FROM entries WHERE user_id = ?', [req.user.id], (err, rows) => {
        if (err) {
            return res.status(500).send('Ошибка при получении записей');
        }

        const existingDates = rows.map(row => row.date);

        res.render('home', {
            user: req.user,
            existingDates: existingDates // Передаем даты с записями
        });
    });
};

// Retrieve entries by date
exports.getEntriesByDate = (req, res) => {
    const { year, month, day } = req.params;
    const date = `${year}-${month}-${day}`;
    const userId = req.user.id;

    db.all('SELECT * FROM entries WHERE date = ? AND user_id = ?', [date, userId], (err, rows) => {
        if (err) {
            return res.status(500).send('Ошибка при получении записей');
        }

        if (rows.length === 0) {
            return res.render('entry', {
                data: { date: date, isExists: false },
                isToday: new Date(date).toDateString() === new Date().toDateString(),
                user: req.user
            });
        }

        rows.forEach(row => {
            row.tags = row.tags ? row.tags.split(',') : [];
        });

        rows[0].isExists = true;
        res.render('entry', {
            data: rows[0],
            isToday: new Date(date).toDateString() === new Date().toDateString(),
            user: req.user
        });
    });
};

// Create a new entry
exports.createEntry = (req, res) => {
    const { date, content, tags } = req.body;
    const editDate = Date.now();
    const userId = req.user.id;

    db.run('INSERT INTO entries (date, editDate, content, tags, user_id) VALUES (?, ?, ?, ?, ?)', [date, editDate, content, tags, userId], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при создании записи' });
        }

        res.json({ message: 'Запись успешно сохранена!' });
    });
};

// Update an existing entry
exports.updateEntry = (req, res) => {
    const id = req.params.id;
    const { content, tags } = req.body;
    const editDate = Date.now();
    const userId = req.user.id;

    // Обновляем только записи, принадлежащие текущему пользователю
    db.run('UPDATE entries SET editDate = ?, content = ?, tags = ? WHERE id = ? AND user_id = ?', [editDate, content, tags, id, userId], (err) => {
        if (err) {
            return res.status(500).json({ message: `Ошибка при обновлении записи с ID ${id}` });
        }

        res.json({ message: 'Запись успешно обновлена!' });
    });
};

// Delete an entry
exports.deleteEntry = (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;

    // Удаляем только записи, принадлежащие текущему пользователю
    db.run('DELETE FROM entries WHERE id = ? AND user_id = ?', [id, userId], (err) => {
        if (err) {
            return res.status(500).send(`Ошибка при удалении записи с ID ${id}`);
        }

        res.send(`Запись с ID ${id} успешно удалена!`);
    });
};

// Функция для поиска записей
exports.searchEntries = (req, res) => {
    const { text, tags } = req.body;
    const userId = req.user.id; // Получаем ID пользователя из req.user

    let sql = 'SELECT * FROM entries WHERE user_id = ?';
    const params = [userId];

    if (text && text.trim()) {
        sql += ' AND content LIKE ?';
        params.push(`%${text.trim()}%`);
    }

    if (tags && tags.length > 0) {
        tags.split(',').forEach(tag => {
            sql += ' AND tags LIKE ?';
            params.push(`%${tag}%`);
        });
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).send('Ошибка при поиске записей');
        }

        res.render('search', { data: rows, user: req.user });
    });
};