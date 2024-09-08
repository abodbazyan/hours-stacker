import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { confetti } from 'tsparticles-confetti/esm'

const firebaseConfig = {
    apiKey: "AIzaSyCptZszH6wv8Bel3YixMmPsU1GrUQMFkAY",
    authDomain: "hours-stacker.firebaseapp.com",
    projectId: "hours-stacker",
    storageBucket: "hours-stacker.appspot.com",
    messagingSenderId: "768852148058",
    appId: "1:768852148058:web:00c5c326baea1eb21b3d63"
};

const STORAGE = {
    SRS: 'ru_time_srs',
    READING: 'ru_time_reading',
    LISTENING: 'ru_time_listening',
    OTHER: 'ru_time_other',
    WRITING: 'ru_time_writing',
    SPEAKING: 'ru_time_speaking',
    SESSION: 'ru_time_session',
    TODAY: 'ru_time_today',
    STATS: 'ru_time_stats',
    TASKS_LIST: 'ru_tasks_list'
};

const translations = {
    SRS: 'SRS',
    READING: 'Reading',
    LISTENING: 'Listening',
    OTHER: 'Others',
    WRITING: 'Writing',
    SPEAKING: 'Speaking'
};

initializeApp(firebaseConfig);

const db = getFirestore();
const colRef = collection(db, 'time');
const confettiEndDate = Date.now() + 2.5 * 1000;
const confettiColors = ["fff200", "ff1e00", "0011ff", "0011ff", "00ff1e", "ffffff"];
let state = undefined, isFirstLoad = true;

onSnapshot(colRef, (snapshot) => {
    let document = snapshot?.docs?.filter(el => el?.id == 'JjOczmRIO7tr8PLxLyj9')?.[0];

    state = {
        id: document?.id,
        ...document?.data()
    };

    if (isFirstLoad) {
        isFirstLoad = false;
        setupApp();
    } else {
        displayData();
    }

    const timeout = Math.floor(Math.random() * (1000 - 500 + 1) + 500);
    const today_data = getValue(STORAGE.TODAY);
    const isTodaysChallengeCompleted = parseInt(convertMsToHM(today_data.time, 'hm').split(' : ')[0]) >= today_data.goal;

    setTimeout(() => {
        setLoading(false);

        if (isTodaysChallengeCompleted) {
            playConfettiEffect();
        }
    }, timeout);
});

function setupApp() {
    const html_show_details = document.querySelector('#show-details');
    const action_btns = document.querySelectorAll('.panel-item');
    const add_outer_value_form = document.querySelector('.add-outer-value');
    const game_info_name = window.document.querySelector('.game-info--name');

    const flickerLetter = letter => `<span style="animation: text-flicker-in-glow ${Math.random() * 4}s linear both ">${letter}</span>`
    const colorLetter = letter => `<span style="color: hsla(${Math.random() * 360}, 100%, 80%, 1);">${letter}</span>`;
    const flickerAndColorText = text => text.split('').map(flickerLetter).map(colorLetter).join('');
    const neonGlory = target => target.innerHTML = flickerAndColorText(target.textContent);

    neonGlory(game_info_name);

    game_info_name.onclick = ({ target }) => neonGlory(target);

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
                const stats_list = getValue(STORAGE.STATS);

                if (!stats_list[this.dataset.type]) {
                    stats_list[this.dataset.type] = 0;
                    stats_list[this.dataset.type] = session_time
                } else {
                    stats_list[this.dataset.type] = stats_list[this.dataset.type] + session_time
                }

                today_data.time = new_today_time;

                setValue(STORAGE.SESSION, 0);
                setValue(STORAGE.TODAY, today_data);
                setValue(STORAGE.STATS, stats_list);
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
            const stats_list = getValue(STORAGE.STATS);
            const new_today_time = today_data.time + result;

            if (!stats_list[time_options.value]) {
                stats_list[time_options.value] = 0;
                stats_list[time_options.value] = result
            } else {
                stats_list[time_options.value] = stats_list[time_options.value] + result
            }

            today_data.time = new_today_time;

            setValue(STORAGE.TODAY, today_data);
            setValue(STORAGE.STATS, stats_list);
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
    const html_progress_bar_b2 = document.querySelector('#B2');
    const html_progress_bar_c2 = document.querySelector('#C2');
    const html_title_b2 = document.querySelector('#B2-title');
    const html_title_c2 = document.querySelector('#C2-title');
    const html_today_result_time = document.querySelector('.today-result--time');
    const html_today_result_text = document.querySelector('.today-result--text');
    const html_stats_list = document.querySelector('.stats-list');
    let total_value = 0;

    html_hours_elements.forEach(element => {
        const element_value = getValue(STORAGE[element.dataset.hours]);
        total_value = total_value + element_value;
        element.innerText = convertMsToHM(element_value, 'hm');
    });

    const value_game_info_hours = convertMsToHM(total_value, 'hm');
    let progress = convertMsToHM(total_value, 'h');

    html_game_info_hours.innerText = `${value_game_info_hours} \u00A0 hrs on record`;

    if (progress < 650) {
        html_progress_bar_b2.style.width = `${progress / 6.5}%`;
    } else if (progress < 1500) {
        progress -= 650;
        html_progress_bar_b2.style.width = `${100}%`;
        html_title_b2.classList.add('progress-bar-complete');
        html_progress_bar_c2.style.width = `${progress / 8.5}%`;
    } else {
        html_progress_bar_b2.style.width = `${100}%`;
        html_progress_bar_c2.style.width = `${100}%`;
        html_title_b2.classList.add('progress-bar-complete');
        html_title_c2.classList.add('progress-bar-complete');
    }

    const today_data = getValue(STORAGE.TODAY);
    const tasks_list_html = document.querySelector('.tasts-list');

    if (isToday(new Date(today_data?.date))) {
        const isTodaysChallengeCompleted = parseInt(convertMsToHM(today_data.time, 'hm').split(' : ')[0]) >= today_data.goal;

        if (isTodaysChallengeCompleted) {
            html_today_result_time.classList.add('today-result--completed');
            html_today_result_text.classList.add('today-result--completed');
        }

        html_today_result_time.innerText = convertMsToHM(today_data.time, 'hm');
    } else {
        const newDate = {
            time: 0,
            date: new Date(),
            goal: today_data?.goal || 3
        };

        const tasks_list = getValue(STORAGE.TASKS_LIST);
        const new_tasks_list = tasks_list.map(task => ({
            ...task,
            completed: false
        }));

        setValue(STORAGE.TODAY, newDate);
        setValue(STORAGE.TASKS_LIST, new_tasks_list);
        setValue(STORAGE.STATS, {});
    }

    if (tasks_list_html.children.length == 0) {
        renderToDoList();
    }

    const stats_list = getValue(STORAGE.STATS);
    const stats_list_keys = Object.keys(stats_list)

    if (stats_list_keys.length) {
        stats_list_keys.forEach(key => {
            const existing_stat = document.querySelector(`[data-stats=${key}]`);
            const stat_value = convertMsToHM(stats_list[key], 'hm');

            if (existing_stat) {
                existing_stat.innerText = stat_value;
            } else {
                const item = document.createElement('li');
                const span_name = document.createElement('span');
                const span_value = document.createElement('span');

                span_name.innerText = translations[key];
                span_value.innerText = stat_value;
                span_value.setAttribute("data-stats", key);

                item.append(span_name, span_value);
                html_stats_list.appendChild(item);
            }
        });
    }
};

function getValue(key) {
    if (
        key == STORAGE.SESSION ||
        key == STORAGE.TODAY ||
        key == STORAGE.TASKS_LIST ||
        key == STORAGE.STATS
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

const playConfettiEffect = () => {
    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: confettiColors
        });

        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: confettiColors
        });

        if (Date.now() < confettiEndDate) {
            requestAnimationFrame(frame);
        }
    })();
};
