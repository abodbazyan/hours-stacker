const STORAGE = {
    SRS: 'time_srs',
    READING: 'time_reading',
    LISTENING: 'time_listening',
    OTHER: 'time_other',
    WRITING: 'time_writing',
    SPEAKING: 'time_speaking',
    SESSION: 'time_session',
    TODAY: 'time_today'
};

initApp();

function initApp() {
    const html_show_details = document.querySelector('#show-details');
    const action_btns = document.querySelectorAll('.panel-item');
    const log_stats_btn = document.querySelector('.log-stats');
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

                window.onunload = function () {
                    const session_time = Date.now() - getValue(STORAGE.SESSION);
                    setValue(STORAGE.SESSION, session_time);
                }

                clicked_btn.classList.add('active');
            } else {
                const session_time = Date.now() - getValue(STORAGE.SESSION);
                const current_total_time = getValue(STORAGE[this.dataset.type]);
                const new_total_time = current_total_time + session_time;
                const today_data = getValue(STORAGE.TODAY);
                const new_today_time = today_data.time + session_time;

                today_data.time = new_today_time;

                setValue(STORAGE[this.dataset.type], new_total_time);
                setValue(STORAGE.SESSION, 0);
                setValue(STORAGE.TODAY, today_data);

                html_session_result_time.innerText = convertMsToHM(session_time, 'hm');

                all_btns.forEach(btn => {
                    btn.disabled = false;
                });

                window.onbeforeunload = null;
                window.onunload = null;

                clicked_btn.classList.remove('active');
            }

            refreshApp();
        })
    }

    log_stats_btn.addEventListener('click', (event) => {
        event.preventDefault();

        for (object_key in STORAGE) {
            const object_value = STORAGE[object_key];
            const storage_value = getValue(object_value);
            const readable_value = convertMsToHM(storage_value, 'hm');

            console.log(object_value, '|', storage_value, '|', readable_value);
        }
    });

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
        setValue(STORAGE[time_options.value], total);

        if (add_to_today.checked) {
            const new_today_time = today_data.time + result;
            today_data.time = new_today_time;
            setValue(STORAGE.TODAY, today_data);
        }

        hours.value = 0;
        minutes.value = 0;
        add_to_today.checked = false;

        refreshApp();
        submit.disabled = false;
    })

    refreshApp();
}

function refreshApp() {
    const html_hours_elements = document.querySelectorAll('[data-hours]');
    const html_game_info_hours = document.querySelector('#game-info-hours');
    const html_progress_bar_n5 = document.querySelector('#N5');
    const html_progress_bar_n4 = document.querySelector('#N4');
    const html_progress_bar_n3 = document.querySelector('#N3');
    const html_progress_bar_n2 = document.querySelector('#N2');
    const html_progress_bar_n1 = document.querySelector('#N1');
    const html_today_result_time = document.querySelector('.today-result--time');
    let total_value = 0;

    html_hours_elements.forEach(element => {
        const element_value = getValue(STORAGE[element.dataset.hours]);
        total_value = total_value + element_value;
        element.innerText = convertMsToHM(element_value, 'hm');
    });

    const value_game_info_hours = convertMsToHM(total_value, 'hm');
    let progress = convertMsToHM(total_value, 'h');

    html_game_info_hours.innerText = `${value_game_info_hours} \u00A0 hrs on record`;

    if (progress <= 462) {
        html_progress_bar_n5.style.width = `${progress / 4.62}%`;
    } else if (progress <= 787) {
        progress -= 462;
        html_progress_bar_n5.style.width = `${100}%`;
        html_progress_bar_n4.style.width = `${progress / 3.25}%`;
        html_progress_bar_n5.parentElement.classList.add('progress-bar-complete');
    } else if (progress <= 1325) {
        progress -= 787;
        html_progress_bar_n5.style.width = `${100}%`;
        html_progress_bar_n4.style.width = `${100}%`;
        html_progress_bar_n5.parentElement.classList.add('progress-bar-complete');
        html_progress_bar_n4.parentElement.classList.add('progress-bar-complete');
        html_progress_bar_n3.style.width = `${progress / 5.38}%`;
    } else if (progress <= 2200) {
        progress -= 1325;
        html_progress_bar_n5.style.width = `${100}%`;
        html_progress_bar_n4.style.width = `${100}%`;
        html_progress_bar_n3.style.width = `${100}%`;
        html_progress_bar_n5.parentElement.classList.add('progress-bar-complete');
        html_progress_bar_n4.parentElement.classList.add('progress-bar-complete');
        html_progress_bar_n3.parentElement.classList.add('progress-bar-complete');
        html_progress_bar_n2.style.width = `${progress / 8.75}%`;
    } else if (progress <= 3900) {
        progress -= 2200;
        html_progress_bar_n5.style.width = `${100}%`;
        html_progress_bar_n4.style.width = `${100}%`;
        html_progress_bar_n3.style.width = `${100}%`;
        html_progress_bar_n2.style.width = `${100}%`;
        html_progress_bar_n5.parentElement.classList.add('progress-bar-complete');
        html_progress_bar_n4.parentElement.classList.add('progress-bar-complete');
        html_progress_bar_n3.parentElement.classList.add('progress-bar-complete');
        html_progress_bar_n2.parentElement.classList.add('progress-bar-complete');
        html_progress_bar_n1.style.width = `${progress / 17}%`;
    } else {
        html_progress_bar_n5.style.width = `${100}%`;
        html_progress_bar_n4.style.width = `${100}%`;
        html_progress_bar_n3.style.width = `${100}%`;
        html_progress_bar_n2.style.width = `${100}%`;
        html_progress_bar_n1.style.width = `${100}%`;
        html_progress_bar_n5.parentElement.classList.add('progress-bar-complete');
        html_progress_bar_n4.parentElement.classList.add('progress-bar-complete');
        html_progress_bar_n3.parentElement.classList.add('progress-bar-complete');
        html_progress_bar_n2.parentElement.classList.add('progress-bar-complete');
        html_progress_bar_n1.parentElement.classList.add('progress-bar-complete');
    }

    const today_data = getValue(STORAGE.TODAY);

    if (isToday(new Date(today_data?.date))) {
        html_today_result_time.innerText = convertMsToHM(today_data.time, 'hm');
    } else {
        const newDate = {
            time: 0,
            date: new Date()
        };

        setValue(STORAGE.TODAY, newDate);
    }
}

function getValue(key) {
    return JSON.parse(window.localStorage.getItem(key)) || 0;
}

function setValue(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
}

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
}

function isToday(dateParameter) {
    const today = new Date();
    return dateParameter?.getDate() === today?.getDate() && dateParameter?.getMonth() === today?.getMonth() && dateParameter?.getFullYear() === today?.getFullYear();
}

function clickEffect(e) {
    const d = document.createElement("div");
    const clickSound = new Audio('./assets/others/click-sound.wav');

    d.className = "clickEffect";
    d.style.top = e.clientY + "px";
    d.style.left = e.clientX + "px";
    document.body.appendChild(d);
    d.addEventListener('animationend', function () { d.parentElement.removeChild(d); }.bind(this));
    clickSound.play();
}

document.addEventListener('click', clickEffect);