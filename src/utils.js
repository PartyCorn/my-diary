exports.formatTimestamp = (timestamp, lang = 'en') => {
    const date = new Date(timestamp);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString(lang + '-GB', options);
};

exports.formatRelativeTimestamp = (timestamp, lang = 'en') => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // разница в секундах

    // Словари для всех поддерживаемых языков
    const timeFormats = {
        en: {
            seconds: ['second ago', 'seconds ago'],
            minutes: ['minute ago', 'minutes ago'],
            hours: ['hour ago', 'hours ago'],
            days: ['day ago', 'days ago'],
            months: ['month ago', 'months ago'],
            years: ['year ago', 'years ago'],
        },
        ru: {
            seconds: ['секунду назад', 'секунд назад', 'секунды назад'],
            minutes: ['минуту назад', 'минут назад', 'минуты назад'],
            hours: ['час назад', 'часов назад', 'часа назад'],
            days: ['день назад', 'дней назад', 'дня назад'],
            months: ['месяц назад', 'месяцев назад', 'месяца назад'],
            years: ['год назад', 'лет назад', 'года назад'],
        },
        de: {
            seconds: ['vor einer Sekunde', 'vor Sekunden'],
            minutes: ['vor einer Minute', 'vor Minuten'],
            hours: ['vor einer Stunde', 'vor Stunden'],
            days: ['vor einem Tag', 'vor Tagen'],
            months: ['vor einem Monat', 'vor Monaten'],
            years: ['vor einem Jahr', 'vor Jahren'],
        },
        es: {
            seconds: ['hace un segundo', 'hace segundos'],
            minutes: ['hace un minuto', 'hace minutos'],
            hours: ['hace una hora', 'hace horas'],
            days: ['hace un día', 'hace días'],
            months: ['hace un mes', 'hace meses'],
            years: ['hace un año', 'hace años'],
        },
        it: {
            seconds: ['un secondo fa', 'secondi fa'],
            minutes: ['un minuto fa', 'minuti fa'],
            hours: ['un\'ora fa', 'ore fa'],
            days: ['un giorno fa', 'giorni fa'],
            months: ['un mese fa', 'mesi fa'],
            years: ['un anno fa', 'anni fa'],
        },
        pl: {
            seconds: ['sekundę temu', 'sekundy temu', 'sekund temu'],
            minutes: ['minutę temu', 'minuty temu', 'minut temu'],
            hours: ['godzinę temu', 'godziny temu', 'godzin temu'],
            days: ['dzień temu', 'dni temu', 'dni temu'],
            months: ['miesiąc temu', 'miesiące temu', 'miesięcy temu'],
            years: ['rok temu', 'lata temu', 'lat temu'],
        },
        ja: {
            seconds: ['秒前', '秒前'],
            minutes: ['分前', '分前'],
            hours: ['時間前', '時間前'],
            days: ['日前', '日前'],
            months: ['ヶ月前', 'ヶ月前'],
            years: ['年前', '年前'],
        },
        fr: {
            seconds: ['il y a une seconde', 'il y a secondes'],
            minutes: ['il y a une minute', 'il y a minutes'],
            hours: ['il y a une heure', 'il y a heures'],
            days: ['il y a un jour', 'il y a jours'],
            months: ['il y a un mois', 'il y a mois'],
            years: ['il y a un an', 'il y a ans'],
        }
    };

    // Функция для выбора правильной формы для русского и польского языка
    const getRussianForm = (number, forms) => {
        if (number % 10 === 1 && number % 100 !== 11) {
            return forms[0];
        } else if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) {
            return forms[2];
        } else {
            return forms[1];
        }
    };

    // Проверка поддерживаемых языков
    if (!timeFormats[lang]) lang = 'en';

    // Определяем временной интервал и выбираем правильное слово
    if (diff < 60) {
        const seconds = Math.floor(diff);
        return lang === 'ru' || lang === 'pl' ? 
            `${seconds} ${getRussianForm(seconds, timeFormats[lang].seconds)}` : 
            `${seconds} ${timeFormats[lang].seconds[seconds === 1 ? 0 : 1]}`;
    } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return lang === 'ru' || lang === 'pl' ? 
            `${minutes} ${getRussianForm(minutes, timeFormats[lang].minutes)}` : 
            `${minutes} ${timeFormats[lang].minutes[minutes === 1 ? 0 : 1]}`;
    } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return lang === 'ru' || lang === 'pl' ? 
            `${hours} ${getRussianForm(hours, timeFormats[lang].hours)}` : 
            `${hours} ${timeFormats[lang].hours[hours === 1 ? 0 : 1]}`;
    } else if (diff < 2592000) {
        const days = Math.floor(diff / 86400);
        return lang === 'ru' || lang === 'pl' ? 
            `${days} ${getRussianForm(days, timeFormats[lang].days)}` : 
            `${days} ${timeFormats[lang].days[days === 1 ? 0 : 1]}`;
    } else if (diff < 31536000) {
        const months = Math.floor(diff / 2592000);
        return lang === 'ru' || lang === 'pl' ? 
            `${months} ${getRussianForm(months, timeFormats[lang].months)}` : 
            `${months} ${timeFormats[lang].months[months === 1 ? 0 : 1]}`;
    } else {
        const years = Math.floor(diff / 31536000);
        return lang === 'ru' || lang === 'pl' ? 
            `${years} ${getRussianForm(years, timeFormats[lang].years)}` : 
            `${years} ${timeFormats[lang].years[years === 1 ? 0 : 1]}`;
    }
};

exports.shortenText = (text, maxLength, firstLine = false) => {
    if (firstLine) {
        text = text.split('\n')[0].slice(0, maxLength);
    }
    if (text.length > maxLength) {
        return text.slice(0, maxLength) + '...';
    } else {
        return text;
    }
};


// exports.insertEntryTags = (entryId, tags, res) => {
//     const tagsWithColor = [];

//     tags.forEach(tag => {
//         tag.color = tag.color || "#fff";
//         db.get('SELECT id, color FROM tags WHERE name = ?', [tag.name], (err, row) => {
//             if (err) {
//                 return res.status(500).send('Ошибка при поиске тега');
//             }

//             if (!row) {
//                 db.run('INSERT INTO tags (name, color) VALUES (?, ?)', [tag.name, tag.color], function(err) {
//                     if (err) {
//                         return res.status(500).send('Ошибка при создании тега');
//                     }

//                     tagsWithColor.push({ name: tag.name, color: tag.color });

//                     if (tagsWithColor.length === tags.length) {
//                         addEntryTags(entryId, tagsWithColor, res);
//                     }
//                 });
//             } else {
//                 tagsWithColor.push({ name: tag.name, color: row.color });

//                 if (tagsWithColor.length === tags.length) {
//                     addEntryTags(entryId, tagsWithColor, res);
//                 }
//             }
//         });
//     });
// };

// function addEntryTags(entryId, tagsWithColor, res) {
//     tagsWithColor.forEach(tag => {
//         db.run('INSERT INTO entry_tags (entry_id, tag_id) VALUES (?, (SELECT id FROM tags WHERE name = ?))', [entryId, tag.name], (err) => {
//             if (err) {
//                 return res.status(500).send('Ошибка при привязке тега к записи');
//             }
//         });
//     });
// };
