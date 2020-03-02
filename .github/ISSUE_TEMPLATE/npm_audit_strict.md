---
name: npm audit disabled
about: npm audit was disabled due to unresolved third-party vulnerability, and must be re-enabled at the earliest possible time.
title: 'Re-enable strict npm audit checking'
labels: bug
assignees: candu

---

**What Happened**
For [TODO: version release] , we had to disable strict `npm audit` checking due to [TODO: vulnerability details](TODO: link) - a fix is in active development, but until that is merged there is no newer version to incorporate.

TODO: explain why this is OK to deploy

**What Should Happen**
`npm audit` should pass with no vulnerabilities and exitcode 0.

**To Reproduce**
Steps to reproduce the bug:
1. run `npm audit`.

**Additional Notes**
Once there is a newer version, we should update the package as quickly as possible.
