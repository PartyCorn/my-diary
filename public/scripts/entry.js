const editButton = document.getElementById('btn-edit');
const cancelButton = document.getElementById('btn-cancel');
const saveButton = document.getElementById('btn-save');
const startButton = document.getElementById('btn-start');
const deleteButton = document.getElementById('btn-delete');
const content = document.getElementById('content');
const tagInput = document.getElementById('tag-input');
const tagContainer = document.querySelector('article .tags-container');
const editor = document.getElementById('editor');

// Функция для перехода в режим редактирования
function enterEditMode() {
    editButton ? editButton.classList.add('hidden') : startButton.classList.add('hidden');
    cancelButton.classList.remove('hidden');
    saveButton.classList.remove('hidden');
    
    content.style.display = 'none';
    editor.style.display = 'block';
    reformatTagsView(true);
}

// Функция для выхода из режима редактирования (отмена)
function exitEditMode() {
    location.reload(); // Перезагружаем страницу, чтобы отменить изменения
}

// Функция для сохранения записи
function saveEntry() {
    const entryId = saveButton.getAttribute('data-entryId');
    const tags = getInlineTags();

    const data = {
        date: document.querySelector('article h1').dataset.date,
        content: tinyMDE.getContent(),
        tags: tags
    };

    const method = entryId ? 'PUT' : 'POST';
    const url = entryId ? `/entries/${entryId}` : '/entries';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        location.reload(); // Обновление интерфейса после сохранения записи
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Обработчики событий
if (editButton) {
    editButton.addEventListener('click', enterEditMode);
}
if (cancelButton) {
    cancelButton.addEventListener('click', exitEditMode);
}
if (saveButton) {
    saveButton.addEventListener('click', saveEntry);
}
if (startButton) {
    startButton.addEventListener('click', enterEditMode); // Старт записи с нуля
}

// Вспомогательные функции для работы с тегами
function reformatTagsView(key) {
    const tags = getTags();
    tagInput.value = tags;
    tagContainer.style.display = key ? 'none': 'block';
    tagInput.style.display = key ? 'block': 'none';
}

function getTags() {
    let tags = [];
    tagContainer.querySelectorAll('.tag').forEach(tagElement => {
        tags.push(tagElement.textContent.replace('#', '').trim());
    });
    return tags.join(',');
}

function getInlineTags() {
    return [...new Set(
        tagInput.value
            .split(',')
            .map(tag => tag.trim().replaceAll(' ', '_').replace(/^#/, '').toLowerCase())
    )]
    .sort()
    .join(',');
}

function deleteEntry(id) {
    fetch(`/entries/${id}`, { method: 'DELETE' })
    .then(response => {
        if (response.ok) {
            location.reload();
        } else {
            console.error('Failed to delete entry');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}