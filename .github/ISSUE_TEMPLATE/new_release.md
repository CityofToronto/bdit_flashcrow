---
name: New Versioned Release
about: Track release checklist for a new versioned release
title: 'New release: Version [TODO: NEW_VERSION]'
labels: release
assignees: candu

---

**Release Checklist**

Maintenance tasks:
- [ ] `npx browserslist@latest --update-db`

All CI checks pass:
- [ ] `npm run ci:npm-outdated` (to fix: update `package.json`, `npm install`; if upgrading a package breaks MOVE, add it to `.ncurc.json`)
- [ ] `npm run ci:npm-audit` (to fix: `npm audit fix`; if issues remain, `npx resolve-audit`)
- [ ] `npm run ci:jest-coverage` (to fix: add / improve tests, address test failures!)
- [ ] `npm run frontend:build` (to fix: address build errors)
- [ ] `npm run docs:build` (to fix: address build errors)

Before deployment:
- [ ] `CHANGELOG.md` is updated to include details of new release
- [ ] version bumped to `[TODO: NEW_VERSION]` in `package.json` using `npm version [TODO: patch|minor|major]`
- [ ] above changes reviewed and merged to `master`
- [ ] `master` pushed to GitLab to initiate CI / CD

See [GitLab CI/CD dashboard](https://gitlab.bdit.intra.prod-toronto.ca/move-team/bdit_flashcrow/pipelines) once pushed.

If promoting to QA:
- [ ] `master` merged up into `deploy-qa`
- [ ] `deploy-qa` pushed to GitLab to initiate CI / CD

If promoting to production:
- [ ] `deploy-qa` merged up into `deploy-prod`
- [ ] `deploy-prod` pushed to GitLab to initiate CI / CD
