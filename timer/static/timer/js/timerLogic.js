// timerLogic.js (new file for testable logic)
export function playSound(type) {
    // Simulate playing sound for 'slice' or 'complete'
    return `sound:${type}`;
}

export function nextSlice(currentSlice, totalSlices) {
    if (currentSlice < totalSlices - 1) {
        return currentSlice + 1;
    }
    return currentSlice; // No more slices
}

export function isTimerComplete(remainingSeconds) {
    return remainingSeconds <= 0;
}