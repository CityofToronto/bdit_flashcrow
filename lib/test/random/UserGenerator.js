import uuid from 'uuid/v4';
import Random from '@/lib/Random';

const FIRST_NAMES = [
  'Jane',
  'John',
  'Jorge',
  'Javier',
  'Jie',
  'Janis',
  'Jale',
];

const LAST_NAMES = [
  'Doe',
  'Doherty',
  'Duende',
  'Dortmund',
  'Daichi',
  'Devan',
  'Dagher',
  'Dimitriou',
];

function generateName() {
  const first = Random.choice(FIRST_NAMES);
  const last = Random.choice(LAST_NAMES);
  const full = `${first} ${last}`;
  const suffix = Random.range(1000, 10000);
  return {
    first,
    last,
    full,
    suffix,
  };
}

function generateUniqueName({ first, last, suffix }) {
  const firstInitial = first[0].toLowerCase();
  const lastLower = last.toLowerCase();
  return `MOVE-TEST\\${firstInitial}${lastLower}${suffix}`;
}

function generateEmail({ first, last, suffix }) {
  return `${first}.${last}${suffix}@toronto.ca`;
}

function generateUser() {
  const sub = uuid();
  const name = generateName();
  const email = generateEmail(name);
  const uniqueName = generateUniqueName(name);
  return {
    email,
    sub,
    uniqueName,
  };
}

const UserGenerator = {
  generateName,
  generateUniqueName,
  generateEmail,
  generateUser,
};

export {
  UserGenerator as default,
  generateName,
  generateUniqueName,
  generateEmail,
  generateUser,
};
