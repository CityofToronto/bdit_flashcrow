import {
  CentrelineType,
  SearchKeys,
  SortKeys,
  StudyRequestAssignee,
  StudyRequestStatus,
  StudyType,
} from '@/lib/Constants';
import DateTime from '@/lib/time/DateTime';

test('Constants.SearchKeys', () => {
  const createdAt = DateTime.fromObject({
    year: 2020,
    month: 2,
    day: 14,
  });
  const location = {
    centrelineId: 1234,
    centrelineType: CentrelineType.INTERSECTION,
    description: 'Foo Ave and Bar St',
    lng: 0,
    lat: 0,
  };

  const REQUEST = {
    id: 42,
    location: null,
    requestedBy: null,
    studyRequest: {
      createdAt,
      id: 42,
      urgent: false,
      assignedTo: null,
      studyType: StudyType.TMC,
    },
  };

  expect(SearchKeys.Requests.ASSIGNED_TO('', REQUEST)).toBe(true);
  expect(SearchKeys.Requests.ASSIGNED_TO('n', REQUEST)).toBe(true);
  expect(SearchKeys.Requests.ASSIGNED_TO('None', REQUEST)).toBe(true);
  REQUEST.studyRequest.assignedTo = StudyRequestAssignee.FIELD_STAFF;
  expect(SearchKeys.Requests.ASSIGNED_TO('None', REQUEST)).toBe(false);
  expect(SearchKeys.Requests.ASSIGNED_TO('field', REQUEST)).toBe(true);

  expect(SearchKeys.Requests.CREATED_AT('2019', REQUEST)).toBe(false);
  expect(SearchKeys.Requests.CREATED_AT('2020', REQUEST)).toBe(true);

  expect(SearchKeys.Requests.LOCATION('', REQUEST)).toBe(true);
  REQUEST.location = location;
  expect(SearchKeys.Requests.LOCATION('foo ave', REQUEST)).toBe(true);
  expect(SearchKeys.Requests.LOCATION('Bar St', REQUEST)).toBe(true);

  expect(SearchKeys.Requests.REQUESTER('', REQUEST)).toBe(true);
  REQUEST.requestedBy = 'ORG\\BazQuux';
  expect(SearchKeys.Requests.REQUESTER('BAZ', REQUEST)).toBe(true);
  expect(SearchKeys.Requests.REQUESTER('quux', REQUEST)).toBe(true);

  expect(SearchKeys.Requests.STUDY_TYPE('', REQUEST)).toBe(true);
  expect(SearchKeys.Requests.STUDY_TYPE('tmc', REQUEST)).toBe(true);
  expect(SearchKeys.Requests.STUDY_TYPE('TMC', REQUEST)).toBe(true);
  expect(SearchKeys.Requests.STUDY_TYPE('turn', REQUEST)).toBe(true);
  expect(SearchKeys.Requests.STUDY_TYPE('movem', REQUEST)).toBe(true);
  expect(SearchKeys.Requests.STUDY_TYPE('quux', REQUEST)).toBe(false);
});

test('Constants.SortKeys', () => {
  Object.values(SortKeys).forEach((sortKeys) => {
    Object.values(sortKeys).forEach((sortKey) => {
      expect(sortKey).toBeInstanceOf(Function);
    });
  });

  const now = DateTime.local();
  const location = {
    centrelineId: 1234,
    centrelineType: CentrelineType.INTERSECTION,
    description: 'Foo Ave and Bar St',
    lng: 0,
    lat: 0,
  };
  const requestedBy = {
    id: 42,
    createdAt: DateTime.local(),
    sub: '0123456789',
    email: 'Baz.Quux@toronto.ca',
    uniqueName: 'ORG\\BazQuux',
  };
  const createdAt = DateTime.fromObject({
    year: 2020,
    month: 2,
    day: 14,
  });

  const REQUEST_STANDARD = {
    id: 42,
    location,
    requestedBy,
    studyRequest: {
      createdAt,
      dueDate: now,
      id: 42,
      lastEditedAt: null,
      urgent: false,
      assignedTo: StudyRequestAssignee.FIELD_STAFF,
      status: StudyRequestStatus.ASSIGNED,
      studyType: StudyType.TMC,
    },
  };

  const lastEditedAt = DateTime.fromObject({
    year: 2020,
    month: 4,
    day: 13,
  });
  const REQUEST_URGENT = {
    id: 43,
    location,
    requestedBy,
    studyRequest: {
      createdAt,
      dueDate: now,
      id: 43,
      lastEditedAt,
      urgent: true,
      assignedTo: null,
      status: StudyRequestStatus.ASSIGNED,
      studyType: StudyType.TMC,
    },
  };

  expect(SortKeys.Requests.ASSIGNED_TO(REQUEST_STANDARD))
    .toEqual(REQUEST_STANDARD.studyRequest.assignedTo.ordinal);
  expect(SortKeys.Requests.ASSIGNED_TO(REQUEST_URGENT))
    .toEqual(-1);
  expect(SortKeys.Requests.CREATED_AT(REQUEST_STANDARD))
    .toEqual(createdAt.valueOf());
  expect(SortKeys.Requests.DUE_DATE(REQUEST_STANDARD))
    .toEqual(now.valueOf());
  expect(SortKeys.Requests.ID(REQUEST_STANDARD))
    .toEqual(REQUEST_STANDARD.id);
  expect(SortKeys.Requests.LAST_EDITED_AT(REQUEST_STANDARD))
    .toEqual(-Infinity);
  expect(SortKeys.Requests.LAST_EDITED_AT(REQUEST_URGENT))
    .toEqual(lastEditedAt.valueOf());
  expect(SortKeys.Requests.LOCATION(REQUEST_STANDARD))
    .toEqual(REQUEST_STANDARD.location.description);
  expect(SortKeys.Requests.REQUESTER(REQUEST_STANDARD))
    .toEqual(REQUEST_STANDARD.requestedBy);
  expect(SortKeys.Requests.STATUS(REQUEST_STANDARD))
    .toEqual(REQUEST_STANDARD.studyRequest.status.ordinal);
  expect(SortKeys.Requests.STUDY_TYPE(REQUEST_STANDARD))
    .toEqual(REQUEST_STANDARD.studyRequest.studyType.label);
  expect(SortKeys.Requests.URGENT(REQUEST_STANDARD))
    .toEqual(0);
  expect(SortKeys.Requests.URGENT(REQUEST_URGENT))
    .toEqual(1);
});
