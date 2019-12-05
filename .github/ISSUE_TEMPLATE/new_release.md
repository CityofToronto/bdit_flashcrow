---
name: New Release
about: Track release checklist for a new release
title: 'New release: Version [NEW_VERSION]'
labels: release
assignees: candu

---

**Release Checklist**

- [ ] `ci:jest-coverage` passes
- [ ] `npm outdated` red dependencies are updated
- [ ] manually tested in all supported browsers
- [ ] version bumped to `[NEW_VERSION]` in `package.json`
- [ ] above changes reviewed and merged to `master`
- [ ] push to CodeCommit succeeds
- [ ] `#prj_move` notified: MOVE down for new version deployment
- [ ] deployment to AWS succeeds
- [ ] `#prj_move` notified: MOVE back up after new version deployment
