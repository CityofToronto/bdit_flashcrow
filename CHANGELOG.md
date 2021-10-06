# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2021-10-06

## Fixed

- visual bug: map displays when vertical drawer in fully open position

## [1.6.1] - 2021-10-06

- new release CI/CD milk run
## [1.6.0] - 2021-08-25

### Fixed

- Update a couple of tests to use `ExpectMatchers`, and fix failures due to new version of dev dataset

## [1.5.3] - 2021-08-23

### Fixed

- `studyTypeOther` field now available in Track Requests CSV export, as the "Study Type (Other)" column

## [1.5.2] - 2021-08-18

### Changed

- Updated dependencies to latest version after long hiatus due to leave
- Updated developer VM scripts, and made corresponding changes to installation guide

## [1.5.1] - 2021-06-25

### Added

- Ped Delay Summary report!

### Changed

- Switched over to new `counts2` schema for fetching info on counts / studies

### Fixed

- Triaged TODOs across codebase: cleaned up most of these, and filed several new issues based on remaining TODOs

## [1.5.0] - 2021-06-14

### Fixed

- Addressed several usability issues in New Request (#962)

## [1.4.2] - 2021-06-08

### Fixed

- Several usability issues throughout study management flows
- Track Requests bug: non-Data Collection users were seeing all requests on load, instead of only their own
- New Request bug: when adding requests to a new project, "Submit" would break unless the user entered something in "Notes"

## [1.4.1] - 2021-06-01

### Added

- Grouping requests into a new or existing project
- Moving requests between projects
- Removing requests from projects
- Several new REST API endpoints to support above operations

### Changed

- "Bulk Request" reworded to "Project" in several places
- New Request now a single-page flow that supports:
  - both removing _and_ adding studies at locations;
  - changing locations of studies;
  - requesting multiple studies at the same location;
  - adding requested studies to a new or existing project.
- Both single-location and multi-location New Request now use the same flow
- Study request management locations no longer tied to View Data locations

### Fixed

- View Request, Edit Request now support viewing, editing requests with missing or invalid centreline locations
- Usability improvement: can now clear all locations in a multi-location selection
- Report bug: `invage` was always blank (i.e. `null`) in Collision Directory reports when exported in CSV format

### Removed

- Old New Request flow

## [1.4.0] - 2021-05-17

No changes (except the version number!)

## [1.3.2] - 2021-05-12

### Added

- More contextual help for various collision filters
- Left navbar now includes link to MOVE Help Centre

### Changed

- School children definition updated to remove time constraints, add active transportation requirement

### Fixed

- Fixed SQL query bug with "MVCR Missing" and "Not Validated" filters
- Fixed SQL query bug with location search queries containing only stopwords (e.g. "and", "the")
- Several small interaction / usability fixes

## [1.3.1] - 2021-05-06

### Added

- Several new collision filters: Vehicle Type, Validated, MVCR, running red light

### Changed

- New layout for map legend
- Small tweaks to padding in View Map / View Data
- Filter chips now grouped, truncated for collisions and studies
- Definition of school children now includes mode of transport, time of day
- Switched to `maplibre-gl` from `mapbox-gl`

### Fixed

- "Property Damage" renamed to "Damage to City Property" to more accurately reflect meaning

## [1.3.0] - 2021-04-29

### Added

- Download selected / all for Track Requests
- Ability to filter by date ranges in Track Requests: Date Requested, Date Expected

### Changed

- Several more report types now use `ReportTimeUtils`, for more flexible / reliable time handling (e.g. for peak hours)
- Added a few more keys to `CollisionFilters`, in preparation for upcoming Global Filters work

### Fixed

- Track Requests table now correctly resizes with the browser window

### Removed

- Sorting disabled for now in View Bulk Request
- Full-text search on Assignee, Status, Type in Track Requests

## [1.2.1] - 2021-04-12

### Added

- Global filters: first end-to-end implementation, including map integration!
- More collision filters

### Changed

- Track Requests now paginates results

## [1.2.0] - 2021-03-17

No changes (except the version number!)

## [1.1.2] - 2021-03-16

### Added
- automated REST API documentation with `hapi-swagger`

### Changed
- updated to version 2 of Toronto Centreline
- several report types now include full time ranges in web, PDF, and CSV formats

### Fixed
- addressed issue with corridor routing near trailheads in parks
- fixed bug with study type selection controls in Request Study
- addressed several usability issues based on user feedback
- cancellation email should now be sent when updating status via the table at bottom of View Bulk Request
- Peak Hour Factor report now uses motorized vehicle totals, not overall totals

## [1.1.1] - 2021-02-25

### Added
- Peak Hour Factor reports
- "Other" study types, for use when requesting new studies

### Changed
- introduced topbar as potential solution to `<h1>` a11y issues, and to provide natural `<header>`
- several small changes to email notifications, to reduce number of emails sent around bulk requests and improve copy
- Track Requests filters now persist across route changes

### Fixed
- addressed loads of a11y issues: headings, landmarks, semantic markup, screen-reader-only text, `aria-live` notifications, various issues identified through axe
- several small fixes to study request management: status changes are now much more flexible
- small fix to CSV export in Track Requests, to address non-ASCII characters in locations

### Removed
- AADT volume layer is now hidden in frontend

## [1.1.0] - 2021-01-28

### Changed
- no longer attempting to send emails to non-`@toronto.ca` addresses in test environments

## [1.0.2] - 2021-01-26

### Changed
- CSV format for Collision Directory report now matches format of web / PDF reports
- improvements to conflation of collisions and counts against centreline
- day of week for count / study dates throughout interface
- better email notifications around study requests
- warrant report logic as per conversations, feedback with staff and management

### Fixed
- bug in text entry of dates in date picker
- bug in location fetching in Track Requests
- bug in Client, Study Type columns of requests CSV export
- bug in TMC reports for offset intersections

## [1.0.1] - 2020-12-16

### Added
- topbar returns to local, dev, and QA environments, now with "go to prod" button

### Changed
- studies layer now shows grey circles where there are studies, but none of them match current time range
- collisions layers now use layer filters on 10-year tiles, instead of separate sources

### Fixed
- bug in Oracle Infinity analytics where we were using the dev / QA DCS ID in production
- bug in collision popups related to `collision_id` drift between when `collisions` data was updated (nightly) and when vector tiles were generated (weekly)

## [1.0.0] - 2020-12-02

No changes (except the version number!)

## [0.11.1] - 2020-12-01

### Fixed
- bug in certain TMC reports, caused by new centreline update that increases coordinate precision in midblocks but not intersections

### Removed
- help center link in left navbar (to be provided on intranet page instead)

## [0.11.0] - 2020-11-25

### Added
- `Content-Security-Policy` header for added security around static resources
- `tcs:` special keyword for signal search in location search bar
- users can now access MOVE Help Centre

### Changed
- MOVE web services are now run as application-specific "service user"
- Collision and study filters now use date range instead of 1 / 3 / 5 / 10 year selection
- CSV export from Track Requests changed to meet Data Collection needs
- MOVE now uses ISO 8601 `YYYY-MM-DD` date format
- Session timeouts reduced, and set to expire after given period of inactivity (rather than total time since start-of-session)

### Fixed
- small bug in CodeCommit script, which caused it to fail for non-dev environments
- downloaded report filenames now much more informative and user-friendly
- users can now adjust intersection type and road width on signal warrants

### Removed
- unneeded dependencies
- security headers (these are managed by Cloud Services-supplied `nginx` configuration)
- "in beta" top bar (relevant in-app actions have been moved to left navbar)

## [0.10.1] - 2020-11-02

### Changed
- several configuration changes in preparation for security audit

### Fixed
- improved report content and layout
- locations and count dates in both web and PDF formats for printed reports

## [0.10.0] - 2020-10-15

### Fixed
- #666: fixed directional totals bug with 3-way intersections
- #654: Poplar Plains now searchable in location search bar
- #539: midblocks now have more readable / informative names
- #455: report date dropdown, map bottom-right controls, and map legend no longer conflict on 1280x720 screens

## [0.9.8] - 2020-10-09

### Added
- Bulk request management actions in Track Requests

### Changed
- "In development" top bar changed for beta launch, added "Report a Bug"
- Hide collisions layer for certain flows (e.g. Request Study, Edit Locations) to reduce visual clutter and make selection easier

### Fixed
- Proper request selection in Track Requests
- Lots of a11y, usability, and other minor fixes

### Removed
- ETL scripts (these are now in [`bdit_move_etl`](https://github.com/CityofToronto/bdit_move_etl))
- `STUDY_REQUESTS_EDIT` user authentication scope: use `STUDY_REQUESTS` instead to get view / create / edit permissions

## [0.9.7] - 2020-09-22

### Added
- Bulk request support in Track Requests
- View and edit bulk requests
- Show pending bulk requests in View Data

## [0.9.6] - 2020-09-14

### Added
- View Reports multi-location support
- Wizard for bulk study requests

### Changed
- Updated AWS environment configuration to complete QA environment setup

## [0.9.5] - 2020-08-13

### Added
- File storage layer with filesystem support (S3 support to come later!)
- Backend implementation of report generation job

### Changed
- `BackendClient` is now isomorphic, and can be used to make HTTP calls between MOVE backend services

## [0.9.4] - 2020-08-04

### Added
- MOVE Scheduler: a new backend service for managing background jobs such as bulk report generation

## [0.9.3] - 2020-08-04
### Changed
- Run multiple instances of MOVE Reporter in AWS environments

### Added
- Configurable port for MOVE Reporter

## [0.9.2] - 2020-07-30
### Added
- Analytics tracking through City of Toronto Oracle Infinity account

## [0.9.1] - 2020-07-27
### Added
- Multi-location support in View Data

## [0.9.0] - 2020-07-17
### Changed
- Several REST API endpoints now support multi-location queries

### Added
- "In development" message bar at top
- Support for Edge
- Search by traffic signal control (TSC / PX) number in location search, e.g. "signal:1234" or "px:1234"
- Search by arterycode number in location search, e.g. "artery:5678"
- Map and location selection interactions for multi-location
- Corridor routing between selected locations

## [0.8.1] - 2020-06-19
### Fixed
- Empty datasets no longer crash 24-hour detailed and summary reports
- Fixed cross-tabulations in collision reports to include null values and truncate properly
- Improve side-nav behaviour, especially when navigating to View Request
- Make location search bar clearable
- Improve validation states on urgent fields in Request Study

## [0.8.0] - 2020-06-16
### Changed
- FLOW reports now use multi-day, multi-direction studies instead of single-day, single-direction counts
- FLOW reports now show useful report-specific summary statistics at top, as opposed to generic metadata

## [0.7.0] - 2020-05-21
### Added
- Collision directory report
- Collision tabulation report

## [0.6.3] - 2020-05-15
### Changed
- Collision summary now has separate section within View Data
- Total number next to Studies is now unfiltered, to match collisions

### Added
- Collision filtering: emphasis areas, date range, days of week, hours of day, weather
- Collision summary now includes both filtered and unfiltered totals, as well as filtered number of validated collisions
- Stub for collision reports (coming soon!)

## [0.6.2] - 2020-04-29
### Fixed
- Counts no longer disappear and re-appear as users zoom on the map
- Volume layer and legend icon updated to use turquoise tritone scale with variable line width

## [0.6.1] - 2020-04-24
### Fixed
- Non-supervisor users now have "User" filter selected automatically in Track Requests
- Users can no longer deselect shortcut chips in Track Requests by clicking on them again

## [0.6.0] - 2020-04-23
### Changed
- Study requests now only contain a single study
- Reorganized Request Study and View Request to reflect designs

### Added
- Management actions for requests in View Request and Track Requests
- Fulfillment status bar in View Request: shows history of request status
- Search / filter for requests in Track Requests

## [0.5.0] - 2020-04-09
### Fixed
- Location search bar now preserves query across pages

### Changed
- Location search now handles typos / approximate matches

### Added
- Role-based access control / permissions model
- Admin UI to manage user permissions

### Removed
- `isSupervisor` mode for Track Requests (replaced by new permissions model)

## [0.4.1] - 2020-03-31
### Changed
- Sitewide navigation improvements
- Increased test coverage target to 60%

## [0.4.0] - 2020-03-27
### Fixed
- CHANGELOG entries for MOVE versions 0.3.0+ now have correct release dates

### Changed
- Map layer styles updated for greater visibility / contrast
- Map text labels added in Aerial mode

### Added
- AADT volume layer based on 2018 estimates
- 1, 3, 5, 10-year layers for collisions and counts
- Map legend with time range selection and layer toggle controls
- Points of interest: hospitals

## [0.3.3] - 2020-03-12
### Changed
- Colour contrast now WCAG 2.0 AA compliant

## [0.3.2] - 2020-03-04
### Changed
- Several fixes to map navigation, popups, and drawer integration
- MOVE icon now links to View Map page

## [0.3.1] - 2020-03-02
### Changed
- Data pipelines are now zero-downtime
- Initial a11y sweep (except for colour contrast, coming soon!)
- Updated ADFS config to use Cloud Services sandbox instance in AWS

### Added
- Domain-aware configuration on AWS

## [0.3.0] - 2020-02-21
### Changed
- Revamped frontend based on Material Design / Vuetify
- Changed CSS preprocessor from PostCSS to SASS

### Added
- Integration with QA and sandbox ADFS environments
- More robust tools for study request management
- Additional validation on several REST API endpoints

### Removed
- Dropped old "stub" login flow
- Dropped Edge support (for now)

## [0.2.4] - 2019-12-18
### Fixed
- Fix performance issues relating to vector tile loading in MOVE

### Changed
- Info box on map now shows info for collisions and schools
- MOVE application layout changed to drawer / map
- Moved some dynamic vector tile generation over to pre-generated tiles in Airflow
- Updated map layers to reflect pre-generated vs. dynamic tiles
- Track Requests buttons, bulk actions, and layout changed to reflect latest design mocks

### Added
- Commenting for study requests

## [0.2.3] - 2019-12-09
### Changed
- CSV export in Track Requests now lists one line per study
- Moved info box on map to top-left

### Added
- Edit request priority and assign to staff / contractor in Supervisor view of Track Requests
- Dynamic generation of counts, collisions, and schools vector tiles
- Zoomed-out heatmap of collisions

## [0.2.2] - 2019-11-27
### Changed
- MOVE is now open source!
- Deployment scripts for MOVE now include system-level package dependencies
- Track Requests table now includes name of requester

### Added
- Update and delete study requests in Track Requests
- Search functionality for Track Requests
- Supervisor view for Track Requests
- CSV export for Track Requests

### Added
- ETL job to fetch GIS layers from [City of Toronto ArcGIS server](gis.toronto.ca)
- Ported @aharpalaniTO's geocoding script for traffic count locations to Airflow

## [0.2.1] - 2019-11-11
### Fixed
- Fix timezone handling from PostgreSQL to web application server to frontend
- Fix timezone handling in datepicker
- Fix CSV report generation bug in MOVE Reporter

### Changed
- Moved from `us-east-1` AWS region to `ca-central-1`

## [0.2.0] - 2019-10-31
### Changed
- Reports now include comments and day of week

### Added
- PDF generation for 24-hour graphical report, backed by same JSON layouts used for web reports

## [0.1.8] - 2019-10-24
### Fixed
- Fix disk full errors on ETL tier by periodically cleaning up old Airflow logs
- Fix several copy and interaction issues from usability testing
- Fix issue where users could not distinguish volume counts in different directions

### Changed
- Web reports now use JSON layout configuration

### Added
- 15-minute detailed report for Turning Movement Counts
- Detailed 24-hour report
- 24-hour count summary report

## [0.1.7] - 2019-10-16
### Changed
- MOVE Reporter now accepts user-supplied parameters for reports

### Added
- First implementation of Traffic Signal Control Warrant report

## [0.1.6] - 2019-10-09
### Fixed
- Fix bug with date dropdown in report-viewing modal

### Changed
- Reorganized codebase into `lib` and `web` folders

### Added
- Report regression tests that match MOVE Reporter output against output of legacy systems
- `webpack-bundle-analyzer` integration in development, to help monitor bundle sizes over time

## [0.1.5] - 2019-09-26
### Added
- MOVE Reporter introduced as new backend service for generating CSV, JSON, and PDF reports
- CSV and JSON versions of several high-priority reports added

## [0.1.4] - 2019-09-10
### Fixed
- Triage backlog of usability feedback from Code for Canada fellowship

### Changed
- Email notifications now use AWS SES
- Irrelevant study types now hidden from traffic volume count table

## [0.1.3] - 2019-08-29
### Changed
- Web application backend code now in ES6 module format using `esm`
- Expanded database and REST API testing coverage
- Now sharing constants between frontend and backend

### Added
- Map `/roadmap` to MOVE roadmap in application

## [0.1.2] - 2019-08-16
### Fixed
- Fix usability issues from testing

### Added
- Search for signals and pedestrian crossings by ID number (thanks @chelsrosic!)
- Database testing harness using in-memory filesystem

## [0.1.1] - 2019-07-18

### Fixed
- Fix several browser issues in Firefox, Edge

### Changed
- Development VM now based off image in Vagrant Cloud
- Map now includes informational popups when clicking on features
- MOVE application now mounted at `/` instead of `/flashcrow`

### Added
- Unit testing and coverage metrics
- Auto-generated JSDoc documentation
- Save study requests to database
- Send email notification when study request submitted
- Web-only implementation of 24-hour volume and speed percentile summary reports
- Initial version of collision data normalization and geocoding ETL job

### Removed
- Remove Cypress, which was never used and which added significantly to `npm install` times

## [0.1.0] - 2019-06-12
### Changed
- Request Study flow revamped to match designs

### Added
- Generated centreline vector tiles for map via Airflow ETL job
- Map shows actual traffic counts (thanks to @chelsrosic!)
- Mock version of Login
- Mock version of Track Requests
- Input validation for Request Study flow
- Web-only implementation of Turning Movement Count report

## [0.0.5] - 2019-05-10
### Changed
- Updated README to include Vagrant setup instructions for better dev onboarding

### Added
- Introduce Airflow to manage ETL jobs
- Create jobs to geocode traffic volume data and generate development / testing datasets

## [0.0.4] - 2019-04-25
### Fixed
- Addressed several usability concerns from testing of first prototype

### Changed
- Data request process updated to reflect designs for second prototype

### Added
- Initial work on standard app-wide components

## [0.0.3] - 2019-04-03
### Fixed
- Fix an intermittent bug when working with large files in replication by removing `tar` dependency

### Added
- Now replicating traffic volume and collision data to AWS PostgreSQL RDS

## [0.0.2] - 2019-03-29
### Added
- Low fidelity prototype of data request process
- Confirmation modal to complete end-to-end flow
- Small copy and sorting changes from usability feedback

## [0.0.1] - 2019-03-22
### Fixed
- Fix Rest API tests so they could run under the current OpenID Connect authentication setup

### Added
- Initial implementation of the front end and map with controls for the demo app
- ESRI map tiles and City aerial imagery for basemaps
- Navigation, zoom, search and sidebar layout for application
