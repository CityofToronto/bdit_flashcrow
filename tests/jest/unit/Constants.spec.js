import Constants from '@/lib/Constants';

test('Constants.SortKeys', () => {
  Object.values(Constants.SortKeys).forEach((sortKeys) => {
    Object.values(sortKeys).forEach((sortKey) => {
      expect(sortKey).toBeInstanceOf(Function);
    });
  });

  const now = new Date();
  const COUNT_DATE_NULL = {
    date: null,
    status: Constants.Status.NO_EXISTING_COUNT,
    type: Constants.COUNT_TYPES[1],
  };
  const COUNT_DATE_NOW = {
    date: now,
    status: Constants.Status.RECENT,
    type: Constants.COUNT_TYPES[3],
  };
  expect(Constants.SortKeys.Counts.DATE(COUNT_DATE_NULL)).toEqual(-Infinity);
  expect(Constants.SortKeys.Counts.DATE(COUNT_DATE_NOW))
    .toEqual(COUNT_DATE_NOW.date.valueOf());
  expect(Constants.SortKeys.Counts.STATUS(COUNT_DATE_NOW))
    .toEqual(COUNT_DATE_NOW.status);
  expect(Constants.SortKeys.Counts.STUDY_TYPE(COUNT_DATE_NOW))
    .toEqual(COUNT_DATE_NOW.type.label);

  const location = {
    centrelineId: 1234,
    centrelineType: Constants.CentrelineType.INTERSECTION,
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
    status: Constants.RequestStatus.REVIEWED,
  };
  expect(Constants.SortKeys.Requests.DATE(REQUEST))
    .toEqual(now.valueOf());
  expect(Constants.SortKeys.Requests.ID(REQUEST))
    .toEqual(REQUEST.id);
  expect(Constants.SortKeys.Requests.LOCATION(REQUEST))
    .toEqual(REQUEST.location.description);
  expect(Constants.SortKeys.Requests.PRIORITY(REQUEST))
    .toEqual(1);
  expect(Constants.SortKeys.Requests.REQUESTER(REQUEST))
    .toEqual(REQUEST.requestedBy.name);
  expect(Constants.SortKeys.Requests.STATUS(REQUEST))
    .toEqual(REQUEST.status);
});
