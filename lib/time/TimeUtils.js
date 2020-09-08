function numConsecutiveDaysOfWeek(daysOfWeek) {
  const days = new Array(15).fill(false);
  daysOfWeek.forEach((i) => {
    days[i] = true;
    days[i + 7] = true;
  });
  let max = 0;
  let start = 0;
  let inRun = false;
  for (let i = 0; i < 15; i += 1) {
    if (days[i] && !inRun) {
      inRun = true;
      start = i;
    } else if (!days[i] && inRun) {
      inRun = false;
      const size = i - start;
      if (size > max) {
        max = size;
      }
    }
  }
  return max === 14 ? 7 : max;
}

const TimeUtils = {
  numConsecutiveDaysOfWeek,
};

export {
  TimeUtils as default,
  numConsecutiveDaysOfWeek,
};
