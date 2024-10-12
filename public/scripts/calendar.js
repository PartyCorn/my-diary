String.prototype.capitalize = function capitalize() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function loadCalendar(monthsToDisplay = 6) {
    const calendarElement = document.getElementById("calendar");
    const dateDisplay = document.getElementById("yearDisplay");
    const prevButton = document.getElementById("prevYear");
    const nextButton = document.getElementById("nextYear");

    const today = new Date();
    const minDate = new Date(2020, 0, 1); // Минимальная дата
    const maxFutureDate = new Date(today.getFullYear() + 5, today.getMonth(), today.getDate()); // Максимальная дата на 10 лет вперед

    // Начальный месяц - от текущего назад на monthsToDisplay
    let displayedStartDate = new Date(today.getFullYear(), today.getMonth() - (monthsToDisplay - 1), 1); 

    function createCalendar(startDate, monthsCount) {
        calendarElement.innerHTML = ''; // Очищаем календарь
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + monthsCount - 1, 0); // Конец отображаемого периода
        dateDisplay.textContent = `${startDate.toLocaleDateString(lang + '-GB', { year: 'numeric', month: 'short' }).capitalize()} - ${endDate.toLocaleDateString(lang + '-GB', { year: 'numeric', month: 'short' }).capitalize()}`;

        let currentDate = new Date(startDate);

        for (let monthIndex = 0; monthIndex < monthsCount; monthIndex++) {
            const monthElement = document.createElement("div");
            monthElement.className = "month";
            monthElement.id = `month-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

            const monthTitle = document.createElement("h2");
            const monthTitleText = currentDate.toLocaleDateString(lang + '-GB', { month: 'long', year: 'numeric' });
            monthTitle.textContent = monthTitleText.capitalize();
            monthElement.appendChild(monthTitle);

            const weekdaysElement = document.createElement("div");
            weekdaysElement.className = "weekdays";
            weekdays.forEach(day => {
                const dayElement = document.createElement("div");
                dayElement.textContent = day;
                weekdaysElement.appendChild(dayElement);
            });
            monthElement.appendChild(weekdaysElement);

            const daysElement = document.createElement("div");
            daysElement.className = "days";
            const firstDayOfMonth = (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 6) % 7; // Понедельник как первый день недели
            const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

            // Добавляем пустые ячейки перед началом месяца
            for (let i = 0; i < firstDayOfMonth; i++) {
                const emptyCell = document.createElement("div");
                daysElement.appendChild(emptyCell);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement("div");
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                dayElement.textContent = day;
                dayElement.setAttribute("data-date", dateString);

                if (date < minDate) {
                    dayElement.classList.add("disabled-day");
                } else if (date > maxFutureDate) {
                    dayElement.classList.add("disabled-day");
                } else if (date.toDateString() === today.toDateString()) {
                    dayElement.classList.add("current-day");
                } else if (date > today) {
                    // dayElement.classList.add("future-day");
                } else {
                    // dayElement.classList.add("past-day");
                }

                if (existingDates.includes(dateString)) {
                    dayElement.classList.add("existing-day");
                }

                // Разрешаем клик только по доступным датам
                if (date >= minDate && date <= maxFutureDate) {
                    dayElement.addEventListener("click", () => {
                        window.location.href = `/entries/${dateString.replaceAll('-', '/')}`;
                    });
                }

                daysElement.appendChild(dayElement);
            }

            // Добавляем пустые ячейки после последнего дня месяца
            const lastDayOfMonth = (firstDayOfMonth + daysInMonth) % 7;
            if (lastDayOfMonth !== 0) {
                for (let i = lastDayOfMonth; i < 7; i++) {
                    const emptyCell = document.createElement("div");
                    daysElement.appendChild(emptyCell);
                }
            }

            monthElement.appendChild(daysElement);
            calendarElement.appendChild(monthElement);

            // Переходим к следующему месяцу
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        nextButton.disabled = startDate >= maxFutureDate;
        prevButton.disabled = startDate <= minDate;
    }

    prevButton.addEventListener("click", () => {
        displayedStartDate.setMonth(displayedStartDate.getMonth() - monthsToDisplay);
        createCalendar(displayedStartDate, monthsToDisplay);
    });

    nextButton.addEventListener("click", () => {
        displayedStartDate.setMonth(displayedStartDate.getMonth() + monthsToDisplay);
        createCalendar(displayedStartDate, monthsToDisplay);
    });

    createCalendar(displayedStartDate, monthsToDisplay);
}
