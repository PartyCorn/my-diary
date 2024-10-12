const i18n = require('i18n');
const path = require('path');

i18n.configure({
    locales: ['en', 'ru', 'de', 'es', 'fr', 'it', 'ja', 'pl'],
    directory: path.join(__dirname, 'locales'),
    defaultLocale: 'en',
    queryParameter: 'lang',
    autoReload: true,
    updateFiles: false,
    syncFiles: true
});

module.exports = i18n;