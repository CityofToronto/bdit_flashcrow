# MOVE Web Application Backend

The `lib` folder contains the MOVE Web Application Backend, which is a [Hapi](https://hapi.dev/)-based web application server.

- `lib/auth`: authentication, mostly for OpenID Connect;
- `lib/config`: application configuration for different deployment environments;
  - `lib/config/private.js`: configuration file, should *NEVER* be committed;
- `lib/controller`: controllers containing application routes;
- `lib/db`: database handling;
  - `lib/db/db.js`: thin wrapper around `pg-promise` to connect to our application database;
  - `lib/db/*DAO.js`: Data Access Objects, used to query the application database;
- `lib/email`: email notifications;
  - `lib/db/EmailBase.js`: base class for all email notifications;
  - `lib/db/Email*.js`: subclasses of `EmailBase` for specific notifications;
  - `lib/db/Mailer.js`: sends `EmailBase` instances out;
- `lib/geo`: geospatial utilities;
- `lib/i18n`: short for "internationalization", currently used to store application-specific messages;
- `lib/log`: logging-related;
- `lib/math`: used for computations in some reports;
- `lib/model`: `Joi` schemas for different types of objects in our system;
- `lib/reports`: MOVE Reporter libraries;
- `lib/test`: testing-related utilities, mostly to setup and teardown database / API tests;
- `lib/time`: time-related utilities, mostly for human-readable formatting of dates and times.
