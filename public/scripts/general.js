// GENERAL DROPBOXES AND THEME CHANGER
document.addEventListener('DOMContentLoaded', () => {
    const search = document.getElementById('search');
    const searchLink = document.querySelector('#searchLink');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');
    const recentEntryBtns = document.querySelectorAll('.recent-entry-btn');
    const settingsLink = document.querySelector('#settingsLink');
    const settings = document.getElementById('settings');

    function postSettings(data) {
        return fetch('/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    settingsLink.addEventListener('click', function(event) {
        event.preventDefault();
        showModal(settings);

        // Выполняем GET-запрос к /settings
        fetch('/settings')
            .then(response => response.text())
            .then(data => {
                settings.innerHTML = data;
                document.querySelectorAll('.theme-buttons button').forEach(button => {
                    const color = button.dataset.color;
                    const bgColor = button.dataset.bgColor;

                    colorizeThemeButton(button, color, bgColor);
                    button.addEventListener('click', () => changeTheme(Number(button.dataset.index), true));
                });

                document.querySelectorAll('.theme-color-buttons button').forEach(button => {
                    const color = button.dataset.color;
                    const bgColor = button.dataset.bgColor;

                    colorizeThemeButton(button, color, bgColor);
                    button.addEventListener('click', () => {
                        changeThemeColor(color, bgColor, true);
                        colorPicker.value = color;
                        bgColorPicker.value = bgColor;
                    });
                });

                document.getElementById('lang-select').addEventListener('change', (event) => {
                    const lang = event.target.value;
                    postSettings({ lang }).then(response => {
                        if (!response.ok) {
                            console.error('Ошибка при изменении языка');
                        } else {
                            location.reload(); // Перезагрузка страницы для применения языка
                        }
                    });
                });
                
                document.getElementById('beta-btn').addEventListener('change', (event) => {
                    const isEnabled = event.target.checked;
                    postSettings({ beta: isEnabled });
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
                
                const output = document.getElementById('rec-ent-value');
                document.getElementById('rec-ent').oninput = function() {
                    output.textContent = this.value;
                }
                document.getElementById('rec-ent').addEventListener('change', (event) => {
                    const recentEntries = event.target.value;
                    postSettings({ rec_ent: recentEntries });
                })

                document.getElementById('cal-months').addEventListener('change', (event) => {
                    const calMonths = event.target.value;
                    postSettings({ cal_months: calMonths }).then(response => {
                        if (!response.ok) {
                            console.error('Ошибка при изменении количества месяцев');
                        } else {
                            window.calMonths = calMonths;
                            loadCalendar(calMonths);
                        }
                    });
                })
            })
            .catch(error => {
                settings.innerHTML = '<p>Error loading settings.</p>';
                console.error('Error:', error);
            });
    });

    function toggleDropdown(dropdown, show) {
        dropdown.style.display = show ? 'block' : 'none';
    }

    searchLink.addEventListener('click', function(event) {
        event.preventDefault();
        fetch('/api/hashtags')
            .then(response => response.json())
            .then(hashtags => {
                const tagsContainer = search.querySelector('.tags-container');
                tagsContainer.innerHTML = '';
                hashtags.forEach(tag => {
                    const option = document.createElement('div');
                    option.classList.add('tag', 'cursor-pointer');
                    option.textContent = `#${tag}`;
                    tagsContainer.appendChild(option);
                    option.onclick = () => {
                        option.classList.toggle('tag-active');
                    };
                })
            })
            .catch(error => {
                console.error('Ошибка при получении тегов:', error);
            });
        showModal(search);
    });

    searchBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const query = searchInput.value.trim();
        const tags = Array.from(search.querySelectorAll('.tag.tag-active')).map(tag => tag.textContent.slice(1));
        const startDate = document.getElementById('start_date').value;
        const endDate = document.getElementById('end_date').value;
    
        if (query.length > 0) {    
            fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, tags, start_date: startDate, end_date: endDate }),
            })
            .then(response => response.text())
            .then(html => {
                searchResults.innerHTML = html; // Вставляем полученную HTML-страницу внутрь dropdown
                document.querySelectorAll('.entry').forEach(result => {
                    result.addEventListener('click', () => {
                        window.location.href = 'entries/' + result.dataset.href.replaceAll('-', '/');
                    });
                });
            })
            .catch(error => {
                console.error('Ошибка при выполнении поиска:', error);
            });
        } else {
            searchResults.innerHTML = ''; // Очищаем dropdown, если нет текста для поиска
        }
    });

    recentEntryBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation(); // Останавливаем всплытие события
    
            const dropdown = btn.querySelector('.recent-entry-dropdown');
    
            // Закрываем все другие дропдауны
            document.querySelectorAll('.recent-entry-dropdown').forEach(drp => {
                if (drp !== dropdown) {
                    toggleDropdown(drp, false); // Закрываем все дропдауны, кроме текущего
                }
            });
    
            // Тогглим текущий дропдаун
            toggleDropdown(dropdown, dropdown.style.display !== 'block');
        });
    });
    
    // Закрываем дропдауны при клике вне их области
    document.addEventListener('click', (event) => {
        const isClickInside = event.target.closest('.recent-entry-btn');
        if (!isClickInside) {
            document.querySelectorAll('.recent-entry-dropdown').forEach(dropdown => {
                toggleDropdown(dropdown, false); // Закрываем все дропдауны
            });
        }
    });

    function colorizeThemeButton(button, color, bgColor) {
        button.style.backgroundColor = color;
        button.style.border = `2px solid ${bgColor}`;
    }

    function changeTheme(theme, update = false) {
        if (theme === 1) {
            document.documentElement.classList.add('dark-theme');
            if (document.querySelector('zero-md')) document.querySelector('zero-md').shadowRoot.querySelector('.markdown-body').style.color = '#fff';
        } else if (theme === 0) {
            document.documentElement.classList.remove('dark-theme');
            if (document.querySelector('zero-md')) document.querySelector('zero-md').shadowRoot.querySelector('.markdown-body').style.color = '#000';
        } else {
            // Меняющаяся тема (в зависимости от времени суток)
            const hour = new Date().getHours();
            if (hour >= 18 || hour < 6) {
                document.documentElement.classList.add('dark-theme');
                if (document.querySelector('zero-md')) document.querySelector('zero-md').shadowRoot.querySelector('.markdown-body').style.color = '#fff';
            } else {
                document.documentElement.classList.remove('dark-theme');
                if (document.querySelector('zero-md')) document.querySelector('zero-md').shadowRoot.querySelector('.markdown-body').style.color = '#000';
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
            const { theme, color, bg_color, cal_months } = settings;
            try {
                window.calMonths = new Date(cal_months);
                loadCalendar(cal_months);
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

function showConfirmationModal(action, title, func, args=[]) {
    const modal = document.getElementById('confirmation-modal');
    const overlay = document.getElementById('overlay');

    modal.style.display = 'block';
    overlay.style.display = 'block';

    document.querySelector('.modal-content p').innerHTML = title;

    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.textContent = action;
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

function showModal(modal) {
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

function logout() {
    window.location.href = '/logout';
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