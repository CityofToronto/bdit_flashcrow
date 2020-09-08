import { numConsecutiveDaysOfWeek } from '@/lib/time/TimeUtils';

test('TimeUtils.numConsecutiveDaysOfWeek', () => {
  // Simple use cases.
  expect(numConsecutiveDaysOfWeek([])).toBe(0);
  expect(numConsecutiveDaysOfWeek([2, 3, 4])).toBe(3);
  expect(numConsecutiveDaysOfWeek([0, 1, 2, 3, 4, 5, 6])).toBe(7);
  // It should take "wrap-arounds" at end-of-week into account.
  let i;
  for (i = 0; i < 7; i += 1) {
    expect(numConsecutiveDaysOfWeek([i])).toBe(1);
    expect(numConsecutiveDaysOfWeek([i, (i + 3) % 7])).toBe(1);
    expect(numConsecutiveDaysOfWeek([i, (i + 1) % 7])).toBe(2);
    expect(numConsecutiveDaysOfWeek([i, (i + 1) % 7, (i + 3) % 7])).toBe(2);
  }
  // Fuzz testing for invariants.
  const n = 100;
  const p = 0.5;
  for (i = 0; i < n; i += 1) {
    const randomDaysOfWeek = [];
    for (let j = 0; j < 7; j += 1) {
      if (Math.random() < p) {
        randomDaysOfWeek.push(j);
      }
    }
    const k = numConsecutiveDaysOfWeek(randomDaysOfWeek);
    expect(k).toBeGreaterThanOrEqual(0);
    expect(k).toBeLessThanOrEqual(randomDaysOfWeek.length);
  }
});
