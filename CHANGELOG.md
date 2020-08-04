# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
