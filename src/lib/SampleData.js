import Constants from '@/lib/Constants';
import Random from '@/lib/Random';

function randomType() {
  return Random.choice(Constants.COUNT_TYPES);
}

function randomDate(now) {
  const sevenYearsAgo = now - 5 * 365 * 24 * 60 * 60 * 1000;
  const t = Random.range(sevenYearsAgo, now);
  return new Date(t);
}

function getStatus(count, now) {
  const threeYearsAgo = now - 3 * 365 * 24 * 60 * 60 * 1000;
  if (count.date.valueOf() < threeYearsAgo) {
    return Constants.Status.OLD_3;
  }
  return Constants.Status.RECENT;
}

function randomCount(id, now) {
  const type = randomType();
  const date = randomDate(now);

  const count = {
    id,
    type,
    date,
    requestNew: false,
  };
  count.status = getStatus(count, now);
  return count;
}

function rejectCount(count) {
  return count.type.value === 'PED_DELAY'
    || (count.type.value === 'TMC' && count.status === 'GOOD');
}

function randomCounts() {
  const now = new Date().valueOf();
  const counts = [];
  let hasTmc = false;
  let id = 0;
  while (counts.length < 10 || !hasTmc) {
    id += 1;
    const count = randomCount(id, now);
    if (!rejectCount(count)) {
      if (count.type.value === 'TMC') {
        hasTmc = true;
      }
      counts.push(count);
    }
  }
  // create missing entries
  Constants.COUNT_TYPES.forEach((type) => {
    const hasCountOfType = counts.some(c => c.type === type);
    if (!hasCountOfType) {
      const countNotInSystem = {
        id: null,
        type,
        date: null,
        requestNew: false,
        status: Constants.Status.NOT_IN_SYSTEM,
      };
      counts.push(countNotInSystem);
    }
  });

  return counts;
}

export default {
  randomCounts,
};
