exports.formatTimestamp = (timestamp, lang = 'en') => {
    const date = new Date(timestamp);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString(lang + '-GB', options);
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
