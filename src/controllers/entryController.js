const { db } = require('../database');

exports.homePage = (req, res) => {
    const userId = req.user.id;

    // Запрашиваем все даты и недавние записи для текущего пользователя
    const query = `
        SELECT id, date, editDate, content, tags 
        FROM entries 
        WHERE user_id = ? 
        ORDER BY editDate DESC, date DESC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).send('Ошибка при получении записей');
        }

        // Получаем все даты записей
        const existingDates = rows.map(row => row.date);

        // Берем последние 10 записей
        const recentEntries = rows.slice(0, Number(req.user.rec_ent));

        // Рендерим главную страницу и передаем данные пользователя, существующие даты и последние записи
        res.render('home', {
            user: req.user,
            existingDates,
            recentEntries
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

    const minDate = new Date(2020, 0, 1);
    const maxFutureDate = new Date(new Date().getFullYear() + 5, new Date().getMonth(), new Date().getDate()); // Максимум лет вперед

    const entryDate = new Date(date);

    // Проверка на допустимый диапазон дат
    if (entryDate < minDate || entryDate > maxFutureDate) {
        return res.status(400).json({ message: `Дата должна быть в пределах от ${minDate.getFullYear()} года до ${maxFutureDate.getFullYear()}.` });
    }

    // Проверка на существование записи в этот день для данного пользователя
    db.get('SELECT id FROM entries WHERE date = ? AND user_id = ?', [date, userId], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при проверке существующей записи' });
        }

        if (row) {
            return res.status(400).json({ message: `Запись на дату ${date} уже существует. Пожалуйста, выберите другую дату или отредактируйте существующую запись.` });
        }

        // Если записи не существует, создаем новую запись
        db.run('INSERT INTO entries (date, editDate, content, tags, user_id) VALUES (?, ?, ?, ?, ?)', [date, editDate, content, tags, userId], function(err) {
            if (err) {
                return res.status(500).json({ message: 'Ошибка при создании записи' });
            }

            res.json({ message: 'Запись успешно сохранена!' });
        });
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
    const { query, tags, start_date, end_date } = req.body;
    const userId = req.user.id;

    let sql = 'SELECT * FROM entries WHERE user_id = ?';
    const params = [userId];

    if (query && query.trim()) {
        sql += ' AND content COLLATE NOCASE LIKE ?';
        params.push(`%${query.trim()}%`);
    }

    // Фильтр по тегам
    if (tags && tags.length > 0) {
        tags.forEach(tag => {
            sql += ' AND tags LIKE ?';
            params.push(`%${tag}%`);
        });
    }

    // Фильтрация по диапазону дат
    if (start_date && start_date.trim()) {
        sql += ' AND date >= ?';
        params.push(start_date.trim());
    }

    if (end_date && end_date.trim()) {
        sql += ' AND date <= ?';
        params.push(end_date.trim());
    }

    sql += ' ORDER BY editDate DESC, date DESC LIMIT 10';

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).send('Ошибка при поиске записей');
        }

        rows.forEach(row => {
            row.tags = row.tags ? row.tags.split(',') : [];
            if (row.content.length > 100) {
                row.content = row.content.substring(0, 100) + '...';
            }
        });

        res.render('search', { data: rows, user: req.user });
    });
};


// Функция для получения недавно созданных или измененных заметок
exports.getRecentEntries = (req, res) => {
    const userId = req.user.id; // Предполагаем, что идентификатор пользователя доступен в req.user

    // Запрос для получения последних заметок, отсортированных по дате создания или изменения
    const query = `
        SELECT id, date, editDate, content, tags 
        FROM entries 
        WHERE user_id = ? 
        ORDER BY editDate DESC, date DESC 
        LIMIT 6
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при получении записей' });
        }
        // Возвращаем список записей в ответе
        res.json(rows);
    });
};