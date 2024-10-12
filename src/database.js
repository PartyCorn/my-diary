const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('mydiary.db');

db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            email TEXT UNIQUE,
            password TEXT,
            theme INTEGER DEFAULT 2,
            color TEXT DEFAULT '#52c8e5',
            bg_color TEXT DEFAULT '#368598',
            lang TEXT DEFAULT 'en',
            beta BOOLEAN DEFAULT 0,
            cal_months INTEGER DEFAULT 6,
            rec_ent INTEGER DEFAULT 6
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY,
            date TEXT,
            editDate TIMESTAMP,
            content TEXT,
            tags TEXT, -- Store tags as a comma-separated list
            user_id INTEGER, -- Внешний ключ для связи с пользователем
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Связь с таблицей пользователей
        )
    `);
});

function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}

function comparePassword(inputPassword, hashedPassword) {
    return bcrypt.compareSync(inputPassword, hashedPassword);
}

module.exports = {
    db,
    hashPassword,
    comparePassword
};
