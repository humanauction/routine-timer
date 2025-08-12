import { playSound, nextSlice, isTimerComplete } from './timerLogic';

describe('Standalone Timer Logic', () => {
    test('plays sound on slice completion', () => {
        expect(playSound('slice')).toBe('sound:slice');
    });

    test('plays sound on total time completion', () => {
        expect(playSound('complete')).toBe('sound:complete');
    });

    test('autoplays next slice if not last', () => {
        expect(nextSlice(0, 5)).toBe(1);
        expect(nextSlice(3, 5)).toBe(4);
    });

    test('does not autoplay next slice if last', () => {
        expect(nextSlice(4, 5)).toBe(4);
    });

    test('timer is complete when remainingSeconds is zero', () => {
        expect(isTimerComplete(0)).toBe(true);
        expect(isTimerComplete(-1)).toBe(true);
        expect(isTimerComplete(10)).toBe(false);
    });
});