---
name: New Release
about: Track release checklist for a new release
title: 'New release: Version [TODO: NEW_VERSION]'
labels: release
assignees: candu

---

**Release Checklist**

These scripts must pass:
- [ ] `npm run ci:jest-coverage` (to fix: add / improve tests!)
- [ ] `npm run ci:npm-outdated` (to fix: `npx ncu -u`, `npm install`, `npm update`)
- [ ] `npm run ci:npm-audit` (to fix: `npx resolve-audit`)
- [ ] `npm run frontend:build` (to fix: address issues)
- [ ] `npm run docs:build` (to fix: address issues)

Manual browser testing:
- [ ] Chrome
- [ ] Firefox

Manual browser testing - feature list:
- [ ] TODO: add features

Before deployment:
- [ ] `CHANGELOG.md` is updated to include details of new release
- [ ] version bumped to `[TODO: NEW_VERSION]` in `package.json` using `npm version [patch|minor|major]`
- [ ] above changes reviewed and merged to `master`

Deployment:
- [ ] push to CodeCommit succeeds
- [ ] deployment to AWS succeeds
- [ ] `#prj_move` notified: MOVE back up after new version deployment
