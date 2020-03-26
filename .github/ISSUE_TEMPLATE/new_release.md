---
name: New Release
about: Track release checklist for a new release
title: 'New release: Version [NEW_VERSION]'
labels: release
assignees: candu

---

**Release Checklist**

- [ ] `npm run ci:jest-coverage` passes
- [ ] `npm run ci:npm-outdated` passes (use `npx ncu -u && npm install` to address issues)
- [ ] `npm run ci:npm-audit` passes (use `npx resolve-audit` to address issues)
- [ ] `npm run build` passes
- [ ] manually tested in all supported browsers
- [ ] `CHANGELOG.md` is updated to include details of new release
- [ ] version bumped to `[NEW_VERSION]` in `package.json` using `npm version [patch|minor|major]`
- [ ] above changes reviewed and merged to `master`
- [ ] push to CodeCommit succeeds
- [ ] deployment to AWS succeeds
- [ ] `#prj_move` notified: MOVE back up after new version deployment
