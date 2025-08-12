document.addEventListener('DOMContentLoaded', function () {
    initStandaloneTimer();
});

function initStandaloneTimer() {
    // --- CONFIG ---
    const MAX_MINUTES = 90;
    const MIN_MINUTES = 1;
    const DIAL_RADIUS = 120;
    const CENTER = 120;
    const COLORS = [
        "#3f51b5", "#f44336", "#4caf50", "#ff9800",
        "#00bcd4", "#ffc107", "#673ab7"
    ];

    // --- ELEMENTS ---
    const colorPicker = document.getElementById('color-picker');
    let selectedColor = COLORS[0];
    if (colorPicker) {
        colorPicker.value = selectedColor;
        colorPicker.addEventListener('input', function () {
            selectedColor = this.value;
            drawDial();
        });
    }

    let totalMinutes = MIN_MINUTES;
    let remainingSeconds = totalMinutes * 60;
    let timer = null;
    let isRunning = false;
    let slices = [];
    let sliceSize = 1; // default 1 minute per slice

    const timeDisplay = document.getElementById('time-remaining-display');
    const dial = document.getElementById('timer-dial');
    if (dial) {
        dial.setAttribute('viewBox', '0 0 240 240');
    }
    const incrementBtns = [
        { el: document.getElementById('increment-1'), val: 1 },
        { el: document.getElementById('increment-5'), val: 5 },
        { el: document.getElementById('increment-10'), val: 10 }
    ];
    const decrementBtns = [
        { el: document.getElementById('decrement-1'), val: -1 },
        { el: document.getElementById('decrement-5'), val: -5 },
        { el: document.getElementById('decrement-10'), val: -10 }
    ];
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-timer');
    const resetBtn = document.getElementById('reset-timer');
    const totalDurationInput = document.getElementById('total-duration-input');
    const sliceSizeSelect = document.getElementById('slice-size-select');

    // --- UTILS ---
    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }
    function formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
    function polarToCartesian(cx, cy, r, angleInDegrees) {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: cx + (r * Math.cos(angleInRadians)),
            y: cy + (r * Math.sin(angleInRadians))
        };
    }
    function describeArc(cx, cy, r, startAngle, endAngle) {
        const start = polarToCartesian(cx, cy, r, endAngle);
        const end = polarToCartesian(cx, cy, r, startAngle);
        const angleDiff = ((endAngle - startAngle + 360) % 360);
        const largeArcFlag = angleDiff <= 180 ? "0" : "1";
        return [
            "M", cx, cy,
            "L", start.x, start.y,
            "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
            "Z"
        ].join(" ");
    }

    function drawDial() {
        if (!dial) return;
        dial.innerHTML = '';
        slices = [];
        const numSlices = Math.ceil(totalMinutes / sliceSize);
        const anglePerSlice = 360 / numSlices;
        for (let i = 0; i < numSlices; i++) {
            const startAngle = i * anglePerSlice;
            const endAngle = (i + 1) * anglePerSlice;
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", describeArc(CENTER, CENTER, DIAL_RADIUS - 10, startAngle, endAngle));
            path.setAttribute("fill", COLORS[i % COLORS.length]);
            path.setAttribute("stroke", "#fff");
            path.setAttribute("stroke-width", "2");
            path.setAttribute("class", "timer-slice");
            dial.appendChild(path);
            slices.push(path);
        }
        updateDial();
    }

    function updateDial() {
        const numSlices = slices.length;
        const sliceSeconds = sliceSize * 60;
        let completed = Math.floor((totalMinutes * 60 - remainingSeconds) / sliceSeconds);

        for (let i = 0; i < numSlices; i++) {
            slices[i].classList.remove("timer-slice-active", "timer-slice-completed");
            if (i < completed) {
                slices[i].setAttribute("fill", "#8b1538");
                slices[i].setAttribute("fill-opacity", "0.5");
                slices[i].setAttribute("stroke", "#ffffff");
                slices[i].setAttribute("stroke-width", "1");
                slices[i].classList.add("timer-slice-completed");
            } else if (i === completed && isRunning) {
                slices[i].setAttribute("fill", "#f0f2f7");
                slices[i].setAttribute("fill-opacity", "1.0");
                slices[i].setAttribute("stroke", "#c41e3a");
                slices[i].setAttribute("stroke-width", "2");
                slices[i].classList.add("timer-slice-active");
            } else {
                slices[i].setAttribute("fill", "#ffffff");
                slices[i].setAttribute("fill-opacity", "1.0");
                slices[i].setAttribute("stroke", "#e6e8ed");
                slices[i].setAttribute("stroke-width", "1");
            }
        }
    }

    function setTime(minutes) {
        totalMinutes = clamp(minutes, MIN_MINUTES, MAX_MINUTES);
        if (totalDurationInput) totalDurationInput.value = totalMinutes;
        remainingSeconds = totalMinutes * 60;
        updateDisplay();
        drawDial();
    }
    function updateDisplay() {
        if (timeDisplay) timeDisplay.textContent = formatTime(remainingSeconds);
        updateDial();
    }
    function tick() {
        if (remainingSeconds > 0) {
            remainingSeconds--;
            updateDisplay();
        } else {
            stopTimer();
        }
    }
    function startTimer() {
        if (isRunning || remainingSeconds <= 0) return;
        isRunning = true;
        timer = setInterval(tick, 1000);
        updateDial();
        if (startBtn) startBtn.disabled = true;
        if (pauseBtn) pauseBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = false;
    }
    function pauseTimer() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timer);
        updateDial();
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
    }
    function stopTimer() {
        isRunning = false;
        clearInterval(timer);
        remainingSeconds = totalMinutes * 60;
        updateDisplay();
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = true;
    }
    function resetTimer() {
        stopTimer();
        setTime(totalMinutes);
    }

    // --- EVENT LISTENERS ---
    incrementBtns.forEach(btn => {
        if (btn.el) btn.el.addEventListener('click', () => {
            setTime(totalMinutes + btn.val);
        });
    });
    decrementBtns.forEach(btn => {
        if (btn.el) btn.el.addEventListener('click', () => {
            setTime(totalMinutes + btn.val);
        });
    });
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
    if (stopBtn) stopBtn.addEventListener('click', stopTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
    if (totalDurationInput) totalDurationInput.addEventListener('change', function () {
        setTime(parseInt(this.value, 10));
    });
    if (sliceSizeSelect) sliceSizeSelect.addEventListener('change', function () {
        sliceSize = parseInt(this.value, 10);
        drawDial();
    });

    // --- INIT ---
    if (sliceSizeSelect) sliceSize = parseInt(sliceSizeSelect.value, 10);
    setTime(2);
    drawDial();
    if (pauseBtn) pauseBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;
}
