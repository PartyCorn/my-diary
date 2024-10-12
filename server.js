const express = require('express');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
const i18n = require('./src/i18nConfig');
const routes = require('./src/routes');
const { formatTimestamp, formatRelativeTimestamp, shortenText } = require('./src/utils');

const app = express();
const port = process.env.PORT || 3000;

hbs.registerHelper('json', function(context) { return JSON.stringify(context); });
hbs.registerHelper('formatTimestamp', formatTimestamp);
hbs.registerHelper('formatRelativeTimestamp', formatRelativeTimestamp);
hbs.registerHelper('shortenText', shortenText);
hbs.registerHelper('ifeq', function(arg1, arg2, options) { return (arg1 == arg2) ? options.fn(this) : options.inverse(this); });

// Middleware для инициализации i18n и установки языка по умолчанию
app.use(i18n.init);
app.use((req, res, next) => {
    let userLang = req.query.lang || req.acceptsLanguages(i18n.getLocales()) || 'en';
    req.lang = userLang;
    i18n.setLocale(req, userLang);
    next();
});

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

hbs.registerPartials('views/partials');

app.set('views', 'views');
app.set('view engine', 'hbs');

app.use('/', routes);

hbs.registerHelper('__', function() {
    return i18n.__.apply(this, arguments);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
