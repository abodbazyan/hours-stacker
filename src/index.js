import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCptZszH6wv8Bel3YixMmPsU1GrUQMFkAY",
    authDomain: "hours-stacker.firebaseapp.com",
    projectId: "hours-stacker",
    storageBucket: "hours-stacker.appspot.com",
    messagingSenderId: "768852148058",
    appId: "1:768852148058:web:00c5c326baea1eb21b3d63"
};

const STORAGE = {
    SRS: 'time_srs',
    READING: 'time_reading',
    LISTENING: 'time_listening',
    OTHER: 'time_other',
    WRITING: 'time_writing',
    SPEAKING: 'time_speaking',
    SESSION: 'time_session',
    TODAY: 'time_today',
    TASKS_LIST: 'tasks_list'
};

initializeApp(firebaseConfig);

const db = getFirestore();
const colRef = collection(db, 'time');
let state = undefined, isFirstLoad = true;

onSnapshot(colRef, (snapshot) => {
    state = {
        id: snapshot?.docs[0]?.id,
        ...snapshot?.docs[0]?.data()
    };

    if (isFirstLoad) {
        isFirstLoad = false;
        setupApp();
    } else {
        displayData();
    }

    const timeout = Math.floor(Math.random() * (1000 - 500 + 1) + 500);

    setTimeout(() => {
        setLoading(false);
    }, timeout);
});

function setupApp() {
    const html_show_details = document.querySelector('#show-details');
    const action_btns = document.querySelectorAll('.panel-item');
    const add_outer_value_form = document.querySelector('.add-outer-value');

    html_show_details.addEventListener('click', function (event) {
        event.preventDefault();
        const container = document.querySelector('#hours-details');

        if (!container.classList.contains('active')) {
            container.style.height = 'auto';
            container.style.padding = '0px 16px 16px 16px';
            container.classList.add('active');
        } else {
            container.style.height = '0px';
            container.style.padding = '0px';
            container.classList.remove('active');
        }
    });

    for (let i = 0; i < action_btns.length; i++) {
        action_btns[i].addEventListener('click', function (event) {
            event.preventDefault();
            const all_btns = document.querySelectorAll('[data-type]');
            const clicked_btn = document.querySelector(`[data-type=${this.dataset.type}]`);
            const html_session_result_time = document.querySelector('.session-result--time');

            if (!clicked_btn.classList.contains('active')) {
                all_btns.forEach(btn => {
                    if (btn.dataset.type != this.dataset.type) {
                        btn.disabled = true;
                    }
                });

                html_session_result_time.innerText = convertMsToHM(0, 'hm');

                setValue(STORAGE.SESSION, Date.now());

                window.onbeforeunload = function () {
                    return 'Are you sure?';
                }

                clicked_btn.classList.add('active');
            } else {
                const session_time = Date.now() - getValue(STORAGE.SESSION);
                const current_total_time = getValue(STORAGE[this.dataset.type]);
                const new_total_time = current_total_time + session_time;
                const today_data = getValue(STORAGE.TODAY);
                const new_today_time = today_data.time + session_time;

                today_data.time = new_today_time;

                setValue(STORAGE.SESSION, 0);
                setValue(STORAGE.TODAY, today_data);
                updateValue(STORAGE[this.dataset.type], new_total_time);

                html_session_result_time.innerText = convertMsToHM(session_time, 'hm');

                all_btns.forEach(btn => {
                    btn.disabled = false;
                });

                window.onbeforeunload = null;

                clicked_btn.classList.remove('active');
            }
        });
    }

    add_outer_value_form.addEventListener('submit', (event) => {
        event.preventDefault();

        const hours = document.getElementsByName("add-hours")[0];
        const minutes = document.getElementsByName("add-minutes")[0];
        const submit = document.getElementsByName("add-time")[0];
        const time_options = document.getElementsByName("time-options")[0];
        const add_to_today = document.getElementsByName("add-to-today")[0];
        const current_time = getValue(STORAGE[time_options.value]);
        const today_data = getValue(STORAGE.TODAY);

        submit.disabled = true;

        const result = (hours.value * 3600000) + (minutes.value * 60000);
        const total = result + current_time;

        if (add_to_today.checked) {
            const new_today_time = today_data.time + result;
            today_data.time = new_today_time;
            setValue(STORAGE.TODAY, today_data);
        }

        updateValue(STORAGE[time_options.value], total);

        hours.value = "";
        minutes.value = "";
        add_to_today.checked = false;

        submit.disabled = false;
    });

    displayData();
};

function displayData() {
    const html_hours_elements = document.querySelectorAll('[data-hours]');
    const html_game_info_hours = document.querySelector('#game-info-hours');
    const html_progress_bar_n5 = document.querySelector('#N5');
    const html_progress_bar_n4 = document.querySelector('#N4');
    const html_progress_bar_n3 = document.querySelector('#N3');
    const html_progress_bar_n2 = document.querySelector('#N2');
    const html_progress_bar_n1 = document.querySelector('#N1');
    const html_title_n5 = document.querySelector('#N5-title');
    const html_title_n4 = document.querySelector('#N4-title');
    const html_title_n3 = document.querySelector('#N3-title');
    const html_title_n2 = document.querySelector('#N2-title');
    const html_title_n1 = document.querySelector('#N1-title');
    const html_today_result_time = document.querySelector('.today-result--time');
    let total_value = 0;

    html_hours_elements.forEach(element => {
        const element_value = getValue(STORAGE[element.dataset.hours]);
        total_value = total_value + element_value;
        element.innerText = convertMsToHM(element_value, 'hm');
    });

    const value_game_info_hours = convertMsToHM(total_value, 'hm');
    let progress = convertMsToHM(total_value, 'h');

    html_game_info_hours.innerText = `${value_game_info_hours} \u00A0 合計時間`;

    if (progress <= 462) {
        html_progress_bar_n5.style.width = `${progress / 4.62}%`;
    } else if (progress <= 787) {
        progress -= 462;
        html_progress_bar_n5.style.width = `${100}%`;
        html_progress_bar_n4.style.width = `${progress / 3.25}%`;
        html_title_n5.classList.add('progress-bar-complete');
    } else if (progress <= 1325) {
        progress -= 787;
        html_progress_bar_n5.style.width = `${100}%`;
        html_progress_bar_n4.style.width = `${100}%`;
        html_title_n5.classList.add('progress-bar-complete');
        html_title_n4.classList.add('progress-bar-complete');
        html_progress_bar_n3.style.width = `${progress / 5.38}%`;
    } else if (progress <= 2200) {
        progress -= 1325;
        html_progress_bar_n5.style.width = `${100}%`;
        html_progress_bar_n4.style.width = `${100}%`;
        html_progress_bar_n3.style.width = `${100}%`;
        html_title_n5.classList.add('progress-bar-complete');
        html_title_n4.classList.add('progress-bar-complete');
        html_title_n3.classList.add('progress-bar-complete');
        html_progress_bar_n2.style.width = `${progress / 8.75}%`;
    } else if (progress < 3900) {
        progress -= 2200;
        html_progress_bar_n5.style.width = `${100}%`;
        html_progress_bar_n4.style.width = `${100}%`;
        html_progress_bar_n3.style.width = `${100}%`;
        html_progress_bar_n2.style.width = `${100}%`;
        html_title_n5.classList.add('progress-bar-complete');
        html_title_n4.classList.add('progress-bar-complete');
        html_title_n3.classList.add('progress-bar-complete');
        html_title_n2.classList.add('progress-bar-complete');
        html_progress_bar_n1.style.width = `${progress / 17}%`;
    } else {
        html_progress_bar_n5.style.width = `${100}%`;
        html_progress_bar_n4.style.width = `${100}%`;
        html_progress_bar_n3.style.width = `${100}%`;
        html_progress_bar_n2.style.width = `${100}%`;
        html_progress_bar_n1.style.width = `${100}%`;
        html_title_n5.classList.add('progress-bar-complete');
        html_title_n4.classList.add('progress-bar-complete');
        html_title_n3.classList.add('progress-bar-complete');
        html_title_n2.classList.add('progress-bar-complete');
        html_title_n1.classList.add('progress-bar-complete');
    }

    const today_data = getValue(STORAGE.TODAY);
    const tasks_list_html = document.querySelector('.tasts-list');

    if (isToday(new Date(today_data?.date))) {
        html_today_result_time.innerText = convertMsToHM(today_data.time, 'hm');
    } else {
        const newDate = {
            time: 0,
            date: new Date()
        };

        const tasks_list = getValue(STORAGE.TASKS_LIST);
        const new_tasks_list = tasks_list.map(task => ({
            ...task,
            completed: false
        }));

        setValue(STORAGE.TODAY, newDate);
        setValue(STORAGE.TASKS_LIST, new_tasks_list);
    }

    if (tasks_list_html.children.length == 0) {
        renderToDoList();
    }
};

function getValue(key) {
    if (
        key == STORAGE.SESSION ||
        key == STORAGE.TODAY ||
        key == STORAGE.TASKS_LIST
    ) {
        return JSON.parse(window.localStorage.getItem(key)) || 0;
    } else {
        return state?.[key];
    }
};

function setValue(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
};

function updateValue(key, value) {
    setLoading(true);

    const docRef = doc(db, 'time', state?.id);

    updateDoc(docRef, {
        [key]: value
    })
};

function setLoading(value) {
    const loading_screen = document.querySelector('.loading-screen');

    if (value) {
        loading_screen.style.display = 'block';
    } else {
        loading_screen.style.display = 'none';
    }
};

function convertMsToHM(milliseconds, format) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    // 👇️ if seconds are greater than 30, round minutes up (optional)
    minutes = seconds >= 30 ? minutes + 1 : minutes;

    minutes = minutes % 60;

    function padTo2Digits(num) {
        return num.toString().padStart(2, '0');
    }

    if (format == 'hm') {
        return `${padTo2Digits(hours)} : ${padTo2Digits(minutes)}`;
    } else if (format == 'h') {
        return `${padTo2Digits(hours)}`;
    }
};

function isToday(dateParameter) {
    const today = new Date();
    return dateParameter?.getDate() === today?.getDate() && dateParameter?.getMonth() === today?.getMonth() && dateParameter?.getFullYear() === today?.getFullYear();
};

function todoListItemClicked(event) {
    const tasks_list = getValue(STORAGE.TASKS_LIST);
    const new_tasks_list = tasks_list.map(task => {
        if (task.id == event.target.id) {
            return {
                ...task,
                completed: !task.completed
            }
        } else {
            return task;
        }
    });

    setValue(STORAGE.TASKS_LIST, new_tasks_list);
};

function renderToDoList() {
    const tasks_list = getValue(STORAGE.TASKS_LIST);
    const tasks_list_html = document.querySelector('.tasts-list');

    const tasks = tasks_list.map(function (task) {
        return createToDoListElement(task);
    });

    tasks_list_html.append(...tasks);
};

function createToDoListElement(task) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    const span_mark = document.createElement('span');
    const span_desc = document.createElement('span');

    label.classList.add('tasks-list-item');
    span_mark.classList.add('tasks-list-mark');

    input.classList.add('tasks-list-cb');
    input.setAttribute("type", "checkbox");
    input.setAttribute("name", task.id);
    input.setAttribute("value", task.id);
    task.completed && input.setAttribute("checked", task.completed);

    span_desc.classList.add('tasks-list-desc');
    span_desc.innerText = task.text;
    span_desc.id = task.id;
    span_desc.onclick = todoListItemClicked;

    label.append(input, span_mark, span_desc);

    return label;
};
