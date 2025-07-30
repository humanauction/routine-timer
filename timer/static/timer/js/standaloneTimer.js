document.addEventListener('DOMContentLoaded', function () {
    // --- CONFIG ---
    const MAX_MINUTES = 90;
    const MIN_MINUTES = 1;
    const DIAL_RADIUS = 120;
    const CENTER = 120;
    // Default colors for slices
    const COLORS = [
        "#3f51b5",
        "#f44336",
        "#4caf50",
        "#ff9800",
        "#00bcd4",
        "#ffc107",
        "#673ab7",
    ];

    const colorPicker = document.getElementById('color-picker');
    let selectedColor = COLORS[0];
    if (colorPicker) {
        colorPicker.value = selectedColor;
        colorPicker.addEventListener('input', function () {
            selectedColor = this.value;
            drawDial();
        });
    }

    // --- STATE ---
    let totalMinutes = 0;
    let remainingSeconds = totalMinutes * 60;
    let timer = null;
    let isRunning = false;
    let slices = [];

    // --- ELEMENTS ---
    const timeDisplay = document.getElementById('time-remaining-display');
    const dial = document.getElementById('timer-dial');
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

    // --- NEW: Slice Size State ---
    let sliceSize = 1; // default 1 minute per slice

    // --- UTILS ---
    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }
    function formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    // --- SVG PIE SLICE GENERATOR ---
    function describeArc(cx, cy, r, startAngle, endAngle) {
        // MODIFIED VERSION of https://stackoverflow.com/a/18473154
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
    function polarToCartesian(cx, cy, r, angleInDegrees) {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: cx + (r * Math.cos(angleInRadians)),
            y: cy + (r * Math.sin(angleInRadians))
        };
    }

    function drawDial() {
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
            if (i < completed) {
                // Faded (completed)
                slices[i].setAttribute("fill-opacity", "0.3");
                slices[i].setAttribute("stroke", COLORS[i % COLORS.length]);
                slices[i].setAttribute("stroke-width", "2");
            } else if (i === completed && isRunning) {
                // Outline (active)
                slices[i].setAttribute("fill-opacity", "0.2");
                slices[i].setAttribute("stroke", COLORS[i % COLORS.length]);
                slices[i].setAttribute("stroke-width", "1");
                slices[i].classList.add("timer-slice-active");
            } else {
                // Solid (not started)
                slices[i].setAttribute("fill-opacity", "1.0");
                slices[i].setAttribute("stroke", "#fff");
                slices[i].setAttribute("stroke-width", "2");
            }
        }
    }

    // --- TIMER LOGIC ---
    function setTime(minutes) {
        totalMinutes = clamp(minutes, MIN_MINUTES, MAX_MINUTES);
        totalDurationInput.value = totalMinutes;
        remainingSeconds = totalMinutes * 60;
        updateDisplay();
        drawDial();
    }
    function updateDisplay() {
        timeDisplay.textContent = formatTime(remainingSeconds);
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
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
    }
    function pauseTimer() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timer);
        updateDial();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    function stopTimer() {
        isRunning = false;
        clearInterval(timer);
        remainingSeconds = totalMinutes * 60;
        updateDisplay();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
    }
    function resetTimer() {
        stopTimer();
        setTime(1);
    }

    // --- EVENT LISTENERS ---
    incrementBtns.forEach(btn => {
        btn.el.addEventListener('click', () => {
            setTime(totalMinutes + btn.val);
        });
    });
    decrementBtns.forEach(btn => {
        btn.el.addEventListener('click', () => {
            setTime(totalMinutes + btn.val);
        });
    });
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);
    totalDurationInput.addEventListener('change', function () {
        setTime(parseInt(this.value, 10));
    });
    sliceSizeSelect.addEventListener('change', function () {
        sliceSize = parseInt(this.value, 10);
        drawDial();
    });

    // --- INIT ---
    setTime(2);
    sliceSize = parseInt(sliceSizeSelect.value, 10);
    drawDial();
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
});