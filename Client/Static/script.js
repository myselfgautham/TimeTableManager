function saveTeachersToLocalStorage(teachers) {
    localStorage.setItem('teachers', JSON.stringify(teachers));
}

function loadTeachers() {
    const teachersListDiv = document.getElementById('teachersList');
    teachersListDiv.innerHTML = '';

    const teachers = getTeachersFromLocalStorage();
    for (let teacher in teachers) {
        let teacherDiv = document.createElement('div');
        teacherDiv.classList.add('teacher-item');
        teacherDiv.innerHTML = `
            <p><strong>Name:</strong> ${teacher}</p>
            <p><strong>Monday:</strong> ${teachers[teacher].Monday}</p>
            <p><strong>Tuesday:</strong> ${teachers[teacher].Tuesday}</p>
            <p><strong>Wednesday:</strong> ${teachers[teacher].Wednesday}</p>
            <p><strong>Thursday:</strong> ${teachers[teacher].Thursday}</p>
            <p><strong>Friday:</strong> ${teachers[teacher].Friday}</p>
            <button onclick="editTeacher('${teacher}')">Edit</button>
            <button onclick="deleteTeacher('${teacher}')">Delete</button>
        `;
        teachersListDiv.appendChild(teacherDiv);
    }
}

function saveTeacher(event) {
    event.preventDefault();

    const teacherName = document.getElementById('teacherName').value.trim();
    const mondaySchedule = document.getElementById('mondaySchedule').value.trim();
    const tuesdaySchedule = document.getElementById('tuesdaySchedule').value.trim();
    const wednesdaySchedule = document.getElementById('wednesdaySchedule').value.trim();
    const thursdaySchedule = document.getElementById('thursdaySchedule').value.trim();
    const fridaySchedule = document.getElementById('fridaySchedule').value.trim();

    if (!teacherName || !mondaySchedule || !tuesdaySchedule || !wednesdaySchedule || !thursdaySchedule || !fridaySchedule) {
        alert('Please fill in all fields.');
        return;
    }

    let teachers = getTeachersFromLocalStorage();

    teachers[teacherName] = {
        "Monday": mondaySchedule,
        "Tuesday": tuesdaySchedule,
        "Wednesday": wednesdaySchedule,
        "Thursday": thursdaySchedule,
        "Friday": fridaySchedule
    };

    saveTeachersToLocalStorage(teachers);
    loadTeachers();
    document.getElementById('teacherForm').reset();
}

function editTeacher(teacherName) {
    let teachers = getTeachersFromLocalStorage();
    const teacher = teachers[teacherName];

    document.getElementById('teacherName').value = teacherName;
    document.getElementById('mondaySchedule').value = teacher.Monday;
    document.getElementById('tuesdaySchedule').value = teacher.Tuesday;
    document.getElementById('wednesdaySchedule').value = teacher.Wednesday;
    document.getElementById('thursdaySchedule').value = teacher.Thursday;
    document.getElementById('fridaySchedule').value = teacher.Friday;

    delete teachers[teacherName];
    saveTeachersToLocalStorage(teachers);
}

function deleteTeacher(teacherName) {
    if (confirm(`Are you sure you want to delete ${teacherName}?`)) {
        let teachers = getTeachersFromLocalStorage();
        delete teachers[teacherName];
        saveTeachersToLocalStorage(teachers);
        loadTeachers();
    }
}

function getTeachersFromLocalStorage() {
    let teachers = JSON.parse(localStorage.getItem('teachers'));
    if (!teachers) {// Initial load of teachers on window load

        teachers = {};
        localStorage.setItem('teachers', JSON.stringify(teachers));
    }
    return teachers;
}

function generateTeacherCheckboxes() {
    const teacherListDiv = document.getElementById('teacherList');
    teacherListDiv.innerHTML = '';

    const teachersData = getTeachersFromLocalStorage();
    for (let teacher in teachersData) {
        let label = document.createElement('label');
        label.classList.add('checkbox-label');

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = teacher;
        checkbox.id = teacher;
        label.appendChild(checkbox);

        let labelText = document.createTextNode(teacher);
        label.appendChild(labelText);

        teacherListDiv.appendChild(label);
    }
}

function findSubstitute() {
    const selectedCheckboxes = document.querySelectorAll('#teacherList input[type="checkbox"]:checked');
    if (selectedCheckboxes.length === 0) {
        alert('Please select at least one teacher.');
        return;
    }

    let selectedTeachers = [];
    selectedCheckboxes.forEach(checkbox => {
        selectedTeachers.push(checkbox.value);
    });

    const selectedWeekday = document.getElementById('weekday').value;

    let originalTeachers = {};
    const teachersData = getTeachersFromLocalStorage();
    selectedTeachers.forEach(teacher => {
        originalTeachers[teacher] = teachersData[teacher][selectedWeekday];
    });

    selectedTeachers.forEach(absentTeacher => {
        for (let teacher in teachersData) {
            if (teacher !== absentTeacher) {
                let teacherSchedule = teachersData[teacher][selectedWeekday].split(',');
                let absentTeacherSchedule = originalTeachers[absentTeacher].split(',');

                let classToReplace = null;
                let freePeriodIndex = null;

                teacherSchedule.forEach((period, index) => {
                    if (absentTeacherSchedule[index] !== 'FREE' && period === 'FREE' && absentTeacherSchedule[index] === teachersData[teacher][selectedWeekday].split(',')[index]) {
                        classToReplace = absentTeacherSchedule[index];
                        freePeriodIndex = index;
                    }
                });

                if (classToReplace !== null && freePeriodIndex !== null) {
                    teacherSchedule[freePeriodIndex] = classToReplace;
                }

                teachersData[teacher][selectedWeekday] = teacherSchedule.join(',');
            }
        }
    });

    localStorage.setItem('teachers', JSON.stringify(teachersData));
    displayResult(selectedTeachers, selectedWeekday);
}

function displayResult(selectedTeachers, selectedWeekday) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<h3>${selectedWeekday}</h3>`;

    const teachersData = getTeachersFromLocalStorage();
    for (let teacher in teachersData) {
        if (!selectedTeachers.includes(teacher)) {
            const p = document.createElement('p');
            p.innerHTML = `<strong>${teacher}:</strong> ${teachersData[teacher][selectedWeekday]}`;
            resultDiv.appendChild(p);
        }
    }
}

window.onload = function() {
    generateTeacherCheckboxes();
};