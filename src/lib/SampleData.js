import Constants from '@/lib/Constants';
import Random from '@/lib/Random';

let NEXT_COUNT_ID = 1729;
let NEXT_REQUEST_ID = 26551800;

// COUNTS (STUDIES)

function randomType() {
  return Random.choice(Constants.COUNT_TYPES);
}

function randomDate() {
  const now = new Date().valueOf();
  const sevenYearsAgo = now - 7 * 365 * 24 * 60 * 60 * 1000;
  const t = Random.range(sevenYearsAgo, now);
  return new Date(t);
}

function getStatus(count) {
  const now = new Date().valueOf();
  const threeYearsAgo = now - 3 * 365 * 24 * 60 * 60 * 1000;
  const fiveYearsAgo = now - 5 * 365 * 24 * 60 * 60 * 1000;
  if (count.date.valueOf() < threeYearsAgo) {
    return Constants.Status.OLD_3;
  }
  if (count.date.valueOf() < fiveYearsAgo) {
    return Constants.Status.OLD_5;
  }
  return Constants.Status.RECENT;
}

function randomCount() {
  const id = NEXT_COUNT_ID;
  NEXT_COUNT_ID += 1;
  const type = randomType();
  const date = randomDate();
  const count = {
    id,
    type,
    date,
  };
  count.status = getStatus(count);
  return count;
}

function rejectCount(count) {
  return count.type.value === 'PED_DELAY'
    || (count.type.value === 'TMC' && count.status === 'GOOD');
}

function randomCounts() {
  const counts = [];
  let hasTmc = false;
  while (counts.length < 10 || !hasTmc) {
    const count = randomCount();
    if (!rejectCount(count)) {
      if (count.type.value === 'TMC') {
        hasTmc = true;
      }
      counts.push(count);
    }
  }
  return counts;
}

// REQUESTS

function randomRequestCounts() {
  const k = Random.range(1, 4);
  const counts = [];
  for (let i = 0; i < k; i += 1) {
    const count = randomCount();
    counts.push(count);
  }
  return counts;
}

function randomDueDate() {
  const now = new Date().valueOf();
  const oneYearFromNow = now + 365 * 24 * 60 * 60 * 1000;
  const t = Random.range(now, oneYearFromNow);
  return new Date(t);
}

function randomPriority() {
  return Math.random() < 0.05 ? 'URGENT' : 'STANDARD';
}

function randomStatus() {
  const n = Constants.REQUEST_STATUS_META.length;
  return Random.range(n);
}

function randomRequest() {
  const id = NEXT_REQUEST_ID;
  NEXT_REQUEST_ID += 1;
  const location = { name: 'Kingston and Lee' };
  const dueDate = randomDueDate();
  const priority = randomPriority();
  const requestedBy = { name: 'Shawn Dartsch' };
  const status = randomStatus();
  const counts = randomRequestCounts();

  return {
    id,
    location,
    dueDate,
    priority,
    requestedBy,
    status,
    counts,
  };
}

function randomRequests() {
  const requests = [];
  for (let i = 0; i < 50; i += 1) {
    const request = randomRequest();
    requests.push(request);
  }
  return requests;
}

export default {
  randomCounts,
  randomRequests,
};
