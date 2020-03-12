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
- [ ] `npm audit` passes
- [ ] `npm run build` completes successfully
- [ ] manually tested in all supported browsers
- [ ] `CHANGELOG.md` is updated to include details of new release
- [ ] version bumped to `[NEW_VERSION]` in `package.json` using `npm version [patch|minor|major]`
- [ ] above changes reviewed and merged to `master`
- [ ] push to CodeCommit succeeds
- [ ] deployment to AWS succeeds
- [ ] `#prj_move` notified: MOVE back up after new version deployment
