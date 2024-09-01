// GENERAL DROPBOXES AND THEME CHANGER
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchDropdown = document.getElementById('search-dropdown');
    const account = document.getElementById('account');
    const accountDropdown = document.getElementById('account-dropdown');
    const settingsLink = document.querySelector('a[href="#settings"]');
    const modal = document.getElementById('settings');

    function postSettings(data) {
        return fetch('/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    settingsLink.addEventListener('click', function(event) {
        event.preventDefault();
        showSettingsModal();

        // Выполняем GET-запрос к /settings
        fetch('/settings')
            .then(response => response.text())
            .then(data => {
                modal.innerHTML = data;
                document.querySelectorAll('.theme-buttons button').forEach(button => {
                    const color = button.getAttribute('data-color');
                    const bgColor = button.getAttribute('data-bg-color');

                    colorizeThemeButton(button, color, bgColor);
                    button.addEventListener('click', () => changeTheme(Number(button.getAttribute('data-index')) || 0, true));
                });

                document.querySelectorAll('.theme-color-buttons button').forEach(button => {
                    const color = button.getAttribute('data-color');
                    const bgColor = button.getAttribute('data-bg-color');

                    colorizeThemeButton(button, color, bgColor);
                    button.addEventListener('click', () => {
                        changeThemeColor(color, bgColor, true);
                        colorPicker.value = color; bgColorPicker.value = bgColor;
                    });
                });

                document.querySelectorAll('.lang-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const lang = button.dataset.lang;
                        postSettings({ lang }).then(response => {
                            if (!response.ok) {
                                console.error('Ошибка при изменении языка');
                            } else {
                                location.reload(); // Перезагрузка страницы для применения языка
                            }
                        });
                    });
                });
                
                document.getElementById('beta-btn').addEventListener('change', (event) => {
                    const isEnabled = event.target.checked;
                    postSettings({ beta: isEnabled }).then(response => {
                        if (!response.ok) {
                            console.error('Ошибка при изменении настройки бета-режима');
                        }
                    });
                });
                document.querySelectorAll('.slider').forEach(slider => {
                    slider.addEventListener('click', function() {
                        const checkbox = this.previousElementSibling;
                        checkbox.click();
                    });
                });

                function updateThemeColor(isChangeEvent) {
                    const color = document.getElementById('custom-color-picker').value;
                    const bgColor = document.getElementById('custom-bg-color-picker').value;
                    changeThemeColor(color, bgColor, isChangeEvent);
                }
                
                const colorPicker = document.getElementById('custom-color-picker');
                const bgColorPicker = document.getElementById('custom-bg-color-picker');
                
                colorPicker.addEventListener('input', () => updateThemeColor(false));
                bgColorPicker.addEventListener('input', () => updateThemeColor(false));
                
                colorPicker.addEventListener('change', () => updateThemeColor(true));
                bgColorPicker.addEventListener('change', () => updateThemeColor(true));    
                
                document.getElementById('start-date').addEventListener('change', (event) => {
                    const startDate = event.target.value;
                    postSettings({ start_date: startDate }).then(response => {
                        if (!response.ok) {
                            console.error('Ошибка при изменении даты начала');
                        } else {
                            window.startDate = new Date(startDate);
                            loadCalendar();
                        }
                    });
                })
            })
            .catch(error => {
                modal.innerHTML = '<p>Error loading settings.</p>';
                console.error('Error:', error);
            });
    });

    function toggleDropdown(dropdown, show) {
        dropdown.style.display = show ? 'block' : 'none';
    }

    searchInput.addEventListener('focus', () => toggleDropdown(searchDropdown, true));
    searchInput.addEventListener('blur', () => {
        // Задержка, чтобы успеть кликнуть по результату перед закрытием
        setTimeout(() => toggleDropdown(searchDropdown, false), 200);
    });
    // Обработчик для ввода текста
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
    
        if (query.length > 0) {
            // Регулярное выражение для поиска тегов (слова, начинающиеся с #)
            const tagRegex = /#([\p{L}\d]+)/gu;
            let tags = [];
            let text = query.replaceAll(tagRegex, (match, tag) => {
                tags.push(tag);
                return ''; // Удаляем теги из текста
            }).trim(); // Оставляем только текст без тегов
    
            // Приводим теги к строке, разделенной запятыми
            tags = tags.join(',');
    
            fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, tags }),
            })
            .then(response => response.text())
            .then(html => {
                searchDropdown.innerHTML = html; // Вставляем полученную HTML-страницу внутрь dropdown
                toggleDropdown(searchDropdown, true); // Показываем dropdown с результатами
            })
            .catch(error => {
                console.error('Ошибка при выполнении поиска:', error);
            });
        } else {
            searchDropdown.innerHTML = ''; // Очищаем dropdown, если нет текста для поиска
            toggleDropdown(searchDropdown, false); // Скрываем dropdown
        }
    });

    account.addEventListener('click', () => toggleDropdown(accountDropdown, accountDropdown.style.display !== 'block'));

    document.addEventListener('click', (event) => {
        if (!account.contains(event.target)) toggleDropdown(accountDropdown, false);
    });

    function colorizeThemeButton(button, color, bgColor) {
        button.style.backgroundColor = color;
        button.style.border = `2px solid ${bgColor}`;
    }

    function changeTheme(theme, update = false) {
        if (theme === 1) {
            document.documentElement.classList.add('dark-theme');
        } else if (theme === 0) {
            document.documentElement.classList.remove('dark-theme');
        } else {
            // Меняющаяся тема (например, в зависимости от времени суток)
            const hour = new Date().getHours();
            if (hour >= 18 || hour < 6) {
                document.documentElement.classList.add('dark-theme');
            } else {
                document.documentElement.classList.remove('dark-theme');
            }
        }
    
        // Отправляем обновление на сервер
        if (update) {
            postSettings({ theme }).then(response => {
                if (!response.ok) {
                    console.error('Ошибка при сохранении темы');
                }
            });
        }
    }
    
    function changeThemeColor(color, bgColor, update = false) {
        document.documentElement.style.setProperty('--color', color);
        document.documentElement.style.setProperty('--bg-color', bgColor);
    
        // Отправляем обновление на сервер
        if (update) {
            postSettings({ color, bg_color: bgColor }).then(response => {
                if (!response.ok) {
                    console.error('Ошибка при сохранении цветовой темы');
                }
            });
        }
    }

    fetch('/api/settings')
        .then(response => response.json())
        .then(settings => {
            const { theme, color, bg_color, start_date } = settings;
            try {
                window.startDate = new Date(start_date);
                loadCalendar();
            } catch {}

            changeTheme(theme);

            if (color && bg_color) {
                changeThemeColor(color, bg_color);
            }
        })
        .catch(error => {
            console.error('Ошибка при получении настроек пользователя:', error);
        });
});

function showConfirmationModal(title, func, args) {
    const modal = document.getElementById('confirmation-modal');
    const overlay = document.getElementById('overlay');

    modal.style.display = 'block';
    overlay.style.display = 'block';

    document.querySelector('.modal-content p').innerHTML = title;

    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.onclick = function() {
        func(...args);
        closeModal();
    };

    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.onclick = closeModal;

    window.onclick = function(event) {
        if (event.target == overlay) {
            closeModal();
        }
    };

    window.onkeydown = function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    };
}

function showSettingsModal() {
    const modal = document.getElementById('settings');
    const overlay = document.getElementById('overlay');

    modal.style.display = 'block';
    overlay.style.display = 'block';

    window.onclick = function(event) {
        if (event.target == overlay) {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        }
    };

    window.onkeydown = function(event) {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        }
    };
}

function closeModal() {
    const modal = document.getElementById('confirmation-modal');
    const overlay = document.getElementById('overlay');

    modal.style.display = 'none';
    overlay.style.display = 'none';
}