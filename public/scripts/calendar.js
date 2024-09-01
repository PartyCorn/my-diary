function loadCalendar() {
    const calendarElement = document.getElementById("calendar");
    const todayButton = document.getElementById("todayButton");
    const yearDisplay = document.getElementById("yearDisplay");
    const prevYearButton = document.getElementById("prevYear");
    const nextYearButton = document.getElementById("nextYear");

    const today = new Date();

    let displayedYear = today.getFullYear();

    function createCalendar(year) {
        calendarElement.innerHTML = '';
        yearDisplay.textContent = year;

        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
            const monthElement = document.createElement("div");
            monthElement.className = "month";
            monthElement.id = `month-${year}-${String(monthIndex + 1).padStart(2, '0')}`;

            const monthTitle = document.createElement("h2");
            monthTitle.textContent = `${months[monthIndex]}`;
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
            const firstDayOfMonth = (new Date(year, monthIndex, 1).getDay() + 6) % 7; // Adjusting for week starting on Monday
            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

            // Adding empty cells before the first day of the month
            for (let i = 0; i < firstDayOfMonth; i++) {
                const emptyCell = document.createElement("div");
                daysElement.appendChild(emptyCell);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement("div");
                const date = new Date(year, monthIndex, day);
                const yearStr = date.getFullYear();
                const monthStr = String(date.getMonth() + 1).padStart(2, '0');
                const dayOfMonthStr = String(date.getDate()).padStart(2, '0');

                dayElement.textContent = day;
                const dateString = `${yearStr}-${monthStr}-${dayOfMonthStr}`;
                dayElement.setAttribute("data-date", dateString);

                if (date < startDate) {
                    dayElement.classList.add("future-day");
                } else if (date.toDateString() === today.toDateString()) {
                    dayElement.classList.add("current-day");
                    dayElement.addEventListener("click", () => {
                        window.location.href = `/entries/${yearStr}/${monthStr}/${dayOfMonthStr}`;
                    });
                } else if (date > today) {
                    dayElement.classList.add("future-day");
                } else {
                    dayElement.classList.add("past-day");
                    dayElement.addEventListener("click", () => {
                        window.location.href = `/entries/${yearStr}/${monthStr}/${dayOfMonthStr}`;
                    });
                }
                // Если дата есть в existingDates, добавляем класс existing-day
                if (existingDates.includes(dateString)) {
                    dayElement.classList.add("existing-day");
                }

                daysElement.appendChild(dayElement);
            }

            // Adding empty cells after the last day of the month
            const lastDayOfMonth = (firstDayOfMonth + daysInMonth) % 7;
            if (lastDayOfMonth !== 0) {
                for (let i = lastDayOfMonth; i < 7; i++) {
                    const emptyCell = document.createElement("div");
                    daysElement.appendChild(emptyCell);
                }
            }

            monthElement.appendChild(daysElement);
            calendarElement.appendChild(monthElement);
        }

    nextYearButton.disabled = displayedYear >= today.getFullYear();
    prevYearButton.disabled = displayedYear <= startDate.getFullYear();
    }

    prevYearButton.addEventListener("click", () => {
        displayedYear--;
        createCalendar(displayedYear);
    });

    nextYearButton.addEventListener("click", () => {
        displayedYear++;
        createCalendar(displayedYear);
    });

    todayButton.addEventListener("click", () => {
        displayedYear = today.getFullYear();
        createCalendar(displayedYear);

        document.getElementById(`month-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`).scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    createCalendar(displayedYear);

    // document.getElementById(`month-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`).scrollIntoView({
    //     behavior: "smooth",
    //     block: "start"
    // });
};
