const { db } = require('../database');
const jwt = require('jsonwebtoken');
const config = require('../config');
const i18n = require('i18n');

const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, config.JWT_SECRET, (err, user) => {
            if (err) {
                // return res.status(403).send('Invalid token');
                return res.redirect('/login');
            }
            
            db.get('SELECT * FROM users WHERE id = ?', [user.id], (err, dbUser) => {
                if (err || !dbUser) {
                    return res.redirect('/login');
                }
                user.theme = dbUser.theme;
                user.color = dbUser.color;
                user.bg_color = dbUser.bg_color;
                user.lang = dbUser.lang;
                user.beta = dbUser.beta;
                user.cal_months = dbUser.cal_months;
                user.rec_ent = dbUser.rec_ent;
                i18n.setLocale(req, user.lang);
                req.user = user;
                next();
            });
        });
    } else {
        // res.status(401).send('Access denied');
        return res.redirect('/login');
    }
};

module.exports = authenticateJWT