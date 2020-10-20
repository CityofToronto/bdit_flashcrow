# MOVE REST API

This directory contains route handlers for the MOVE REST API.  Note that this API is currently designed to be used with the MOVE web application.

## Anatomy of a Handler

The MOVE REST API is built using `hapi`, a node.js-based server-side web framework.  Endpoints are declared as follows:

```js
{
  method: 'POST',
  // a path can contain one or more URL parameters (e.g. `{id}`)
  path: '/jobs/{id}/cancel',
  options: {
    auth: {
      // if the endpoint does not require authentication:
      mode: 'try',
      // if the endpoint requires specific user roles ("scopes"):
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    response: {
      // what does a valid response look like?
      schema: StudyRequestBulk.read,
    },
    validate: {
      // what do valid URL parameters look like?
      params: {
        id: Joi.string().uuid().required(),
      },
      // what does a valid request body ("payload") look like?
      payload: StudyRequestBulk.create,
      // what do valid GET query parameters look like?
      query: {
        id: Joi.array().single().items(
          Joi.number().integer().positive().required(),
        ).required(),
      },
    },
  },
  // implementation of handler goes here
  handler: async (request) => { /* ... */ },
});
```

As you can see, endpoint declarations provide useful information about authentication requirements and expected request / response formats.

## Services

The MOVE REST API is split across three services - `web`, `reporter`, and `scheduler`.  These services are reverse-proxied via `nginx` to different root paths, and each handle a subset of the controllers in this directory:

- `reporter`: `/reporter` (`ReportController`);
- `scheduler`: `/scheduler` (`JobController`);
- `web`: `/api` (everything else).

Paths in controllers are relative to these service root paths.  For instance: `CollisionController` is handled by `web`, so to call an endpoint `/collisions/byCentreline` in `CollisionController` you must make a request to `/api/collisions/byCentreline`.

## Common HTTP Codes

All MOVE REST API endpoints return common HTTP codes in the following circumstances.  Other circumstances are documented on a per-endpoint basis, as are any exceptions to these conventions.

### HTTP 400: Bad Request

Returned when the URL parameters, request body ("payload"), or GET query parameters are invalid or missing.

### HTTP 403: Forbidden

Returned when the user must authenticate to access the endpoint but is not authenticated, or when the user is authenticated but lacks sufficient permission (`scope`).

### HTTP 404: Not Found

Returned when the request URL does not correspond to a MOVE REST API endpoint, or when the request would refer to a non-existent resource (e.g. collision, traffic study, study request, etc.)

## Authentication

For routes that require authentication, you must provide a valid `session` cookie with your request.

For non-`GET` routes that additionally modify MOVE application data, you must provide a CSRF token.  There are two ways to pass this token: via the `csrf` cookie, or via the `X-CSRF-Token` request header.

To authenticate, log in via the MOVE web application and complete the OpenID Connect login flow.  MOVE does not currently offer programmatic authentication (e.g. via OAuth, OpenID Connect, etc.)

## Validation

Schemas for request parameters and body are specified using the validation library `joi`.  More complex schemas are stored in [`lib/model`](https://github.com/CityofToronto/bdit_flashcrow/tree/master/lib/model).
