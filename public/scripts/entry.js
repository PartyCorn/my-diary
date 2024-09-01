const md = window.markdownit();
const editButton = document.getElementById('btn-edit');
const saveButton = document.getElementById('btn-save');
const deleteButton = document.getElementById('btn-delete');
const content = document.getElementById('content');
const tagInput = document.getElementById('tag-input');
const tagContainer = document.querySelector('.tags-container');
const editorSpace = document.getElementById('editor-space');
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

const dropdown = document.createElement('div');
dropdown.classList.add('dropdown');
document.body.appendChild(dropdown);

function renderHTML() {
    const html = md.render(editor.value);
    preview.innerHTML = html;
}
editor.addEventListener('input', renderHTML);
const originalContent = saveButton.getAttribute('data-entryId') ? content.innerHTML : '';
content.innerHTML = md.render(content.innerText);
content.style.whiteSpace = 'wrap';

editButton.addEventListener('click', function() {
    const currentState = editButton.getAttribute('data-state');

    switch (currentState) {
        case 'edit':

            saveButton.style.display = 'block';
            editButton.textContent = editButton.getAttribute('data-cancelText');
            editButton.setAttribute('data-state', 'cancel');

            editor.value = originalContent;
            content.style.display = 'none';
            editorSpace.style.display = 'flex';
            renderHTML();
            reformatTagsView(true);
            break;
        case 'cancel':
            location.reload();
            break;
    }
});

saveButton.addEventListener('click', function() {
    const entryId = saveButton.getAttribute('data-entryId');
    const content = document.querySelector('#content');
    const tags = getInlineTags();

    const data = {
        date: document.querySelector('article h1').getAttribute('data-date'),
        content: editor.value,
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

    content.contentEditable = false;

    saveButton.style.display = 'none';
    editButton.textContent = 'Edit';
    editButton.setAttribute('data-state', 'edit');
});

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
    return [...new Set(tagInput.value.split(',').map(tag => tag.trim().replaceAll(' ', '_')))].join(',');
}

function deleteEntry(id) {
    fetch(`/entries/${deleteButton.getAttribute('data-entryId')}`, { method: 'DELETE' })
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