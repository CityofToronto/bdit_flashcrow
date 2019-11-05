import {
  CentrelineType,
  COUNT_TYPES,
  SortKeys,
  Status,
} from '@/lib/Constants';
import DateTime from '@/lib/time/DateTime';

test('Constants.SortKeys', () => {
  Object.values(SortKeys).forEach((sortKeys) => {
    Object.values(sortKeys).forEach((sortKey) => {
      expect(sortKey).toBeInstanceOf(Function);
    });
  });

  const now = DateTime.local();
  const COUNT_DATE_NULL = {
    date: null,
    status: Status.NO_EXISTING_COUNT,
    type: COUNT_TYPES[1],
  };
  const COUNT_DATE_NOW = {
    date: now,
    status: Status.RECENT,
    type: COUNT_TYPES[3],
  };
  expect(SortKeys.Counts.DATE(COUNT_DATE_NULL)).toEqual(-Infinity);
  expect(SortKeys.Counts.DATE(COUNT_DATE_NOW))
    .toEqual(COUNT_DATE_NOW.date.valueOf());
  expect(SortKeys.Counts.DAY(COUNT_DATE_NULL)).toEqual(-Infinity);
  expect(SortKeys.Counts.DAY(COUNT_DATE_NOW))
    .toEqual(COUNT_DATE_NOW.date.weekday);
  expect(SortKeys.Counts.STATUS(COUNT_DATE_NOW))
    .toEqual(COUNT_DATE_NOW.status);
  expect(SortKeys.Counts.STUDY_TYPE(COUNT_DATE_NOW))
    .toEqual(COUNT_DATE_NOW.type.label);

  const location = {
    centrelineId: 1234,
    centrelineType: CentrelineType.INTERSECTION,
    description: 'Foo Ave and Bar St',
    lng: 0,
    lat: 0,
  };
  const requestedBy = {
    email: 'Baz.Quux@toronto.ca',
    name: 'Baz Quux',
  };
  const REQUEST = {
    dueDate: now,
    id: 42,
    location,
    priority: 'URGENT',
    requestedBy,
    status: 'REVIEWED',
  };
  expect(SortKeys.Requests.DATE(REQUEST))
    .toEqual(now.valueOf());
  expect(SortKeys.Requests.ID(REQUEST))
    .toEqual(REQUEST.id);
  expect(SortKeys.Requests.LOCATION(REQUEST))
    .toEqual(REQUEST.location.description);
  expect(SortKeys.Requests.PRIORITY(REQUEST))
    .toEqual(1);
  expect(SortKeys.Requests.REQUESTER(REQUEST))
    .toEqual(REQUEST.requestedBy.name);
  expect(SortKeys.Requests.STATUS(REQUEST))
    .toEqual(REQUEST.status);

  const STUDY = {
    createdAt: now,
  };
  expect(SortKeys.Studies.CREATED_AT(STUDY))
    .toEqual(now.valueOf());
});
