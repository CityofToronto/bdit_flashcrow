<template>
  <div class="full-screen flex-container-row">
    <div class="hide">
      <form
        v-if="auth.loggedIn"
        ref="formSignOut"
        method="POST"
        action="/flashcrow/api/auth/logout"></form>
    </div>
    <component
      v-if="modal !== null"
      :is="modal.component"
      :data="modal.data"
      @modal-close="clearModal"></component>
    <div class="fc-sidebar">
      <FcDashboardBrand />
      <FcDashboardNav>
        <FcDashboardNavItem
          icon="map-marked-alt"
          label="View Data"
          :to="{ name: 'viewData' }" />
        <FcDashboardNavItem
          icon="folder-plus"
          label="Request Study"
          :to="{ name: 'requestStudy' }" />
        <FcDashboardNavItem
          disabled
          icon="clipboard-list"
          label="Track Requests"
          :to="{ name: 'requestsTrack' }" />
        <FcDashboardNavItem
          disabled
          icon="road"
          label="Run Warrant"
          :to="{ name: 'runWarrant' }" />
      </FcDashboardNav>
    </div>
    <div class="fc-content flex-fill flex-container-column">
      <TdsTopBar class="fc-topbar">
        <template v-slot:left>
          <FcToast
            v-if="toast"
            :variant="toast.variant">
            <span>{{toast.text}}</span>
          </FcToast>
          <SearchBarLocation
            :disabled="!auth.loggedIn" />
          <button
            class="font-size-l"
            :disabled="location === null"
            @click="onViewData">
            <i class="fa fa-search"></i>
            <span> View Data</span>
          </button>
        </template>
        <template v-slot:right>
          <TdsActionDropdown
            class="font-size-l"
            :options="userActions"
            @action-selected="onUserAction">
            <span>{{username}} </span>
            <i class="fa fa-user-circle"></i>
          </TdsActionDropdown>
        </template>
      </TdsTopBar>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import 'mapbox-gl/dist/mapbox-gl.css';
import 'v-calendar/lib/v-calendar.min.css';
import '@/components/tds/tds.css';

import FcDashboardBrand from '@/components/FcDashboardBrand.vue';
import FcDashboardNav from '@/components/FcDashboardNav.vue';
import FcDashboardNavItem from '@/components/FcDashboardNavItem.vue';
import FcModalShowReports from '@/components/FcModalShowReports.vue';
import FcModalRequestStudyConfirmation from '@/components/FcModalRequestStudyConfirmation.vue';
import FcToast from '@/components/FcToast.vue';
import ModalComingSoon from '@/components/ModalComingSoon.vue';
import SearchBarLocation from '@/components/SearchBarLocation.vue';
import TdsActionDropdown from '@/components/tds/TdsActionDropdown.vue';
import TdsConfirmDialog from '@/components/tds/TdsConfirmDialog.vue';
import TdsTopBar from '@/components/tds/TdsTopBar.vue';

export default {
  name: 'App',
  components: {
    FcDashboardBrand,
    FcDashboardNav,
    FcDashboardNavItem,
    FcModalShowReports,
    FcModalRequestStudyConfirmation,
    FcToast,
    ModalComingSoon,
    SearchBarLocation,
    TdsActionDropdown,
    TdsConfirmDialog,
    TdsTopBar,
  },
  computed: {
    userActions() {
      if (this.auth.loggedIn) {
        return [{ label: 'Log out', value: 'logout' }];
      }
      return [{ label: 'Log in', value: 'login' }];
    },
    username() {
      if (this.auth.loggedIn) {
        const { email, name } = this.auth.user;
        return name || email;
      }
      return 'Guest';
    },
    ...mapState([
      'auth',
      'location',
      'modal',
      'toast',
    ]),
  },
  methods: {
    onModalToggle() {
      if (!this.$refs.modalToggle.checked) {
        this.clearModal();
      }
    },
    onUserAction(action) {
      if (action === 'login') {
        this.$router.push({ name: 'login' });
      } else if (action === 'logout') {
        this.signOut();
      }
    },
    onViewData() {
      if (this.location === null) {
        return;
      }
      const { centrelineId, centrelineType } = this.location;
      this.$router.push({
        name: 'viewDataAtLocation',
        params: { centrelineId, centrelineType },
      });
    },
    profileComingSoon() {
      this.setModal({
        component: 'ModalComingSoon',
        data: {
          feature: 'user profiles',
        },
      });
    },
    signOut() {
      this.$refs.formSignOut.submit();
    },
    ...mapMutations(['clearModal', 'setModal']),
  },
};
</script>

<style lang="postcss">
/* BOX SIZING */
*, *:before, *:after {
  box-sizing: border-box;
}

/* LAYOUT */
html, body {
  background-color: var(--base-lightest);
  color: var(--ink);
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  height: 100vh;
  margin: 0;
  min-height: 100vh;
  padding: 0;
}
html {
  font-size: 100%;
}
body {
  font-size: var(--font-size-m);
}
.full-screen {
  height: 100vh;
  min-height: 100vh;
  padding: 0;
}
.fc-sidebar {
  background-color: var(--base-darker);
  color: var(--base-lighter);
  width: var(--space-3xl);
}
.fc-topbar {
  position: relative;
  & > .fc-toast {
    left: 0;
    top: 100%;
  }
}

/* TYPOGRAPHY */
h1, h2, h3 {
  font-weight: var(--font-weight-bold);
  margin: var(--space-m) 0;
}
h1 {
  font-size: var(--font-size-2xl);
}
h2 {
  font-size: var(--font-size-xl);
}
h3 {
  font-size: var(--font-size-l);
}
strong {
  font-weight: var(--font-weight-bold);
}
p {
  margin: var(--space-m) 0;
}
hr {
  align-self: stretch;
  margin: var(--space-s) 0;
}
.uppercase {
  text-transform: uppercase;
}
.font-size-xs {
  font-size: var(--font-size-xs);
}
.font-size-s {
  font-size: var(--font-size-s);
}
.font-size-m {
  font-size: var(--font-size-m);
}
.font-size-l {
  font-size: var(--font-size-l);
}
.font-size-xl {
  font-size: var(--font-size-xl);
}
.font-size-2xl {
  font-size: var(--font-size-2xl);
}
.text-muted {
  color: var(--disabled-dark);
}

/* TEXT LABELS */
.tds-label {
  background-color: var(--base-light);
  border-radius: var(--space-m);
  color: var(--base-darker);
  display: inline-block;
  padding: var(--space-s) var(--space-m);
  text-align: center;
  &.tds-label-success {
    background-color: var(--success-light);
    color: var(--success-darker);
  }
  &.tds-label-info {
    background-color: var(--info-light);
    color: var(--info-darker);
  }
  &.tds-label-warning {
    background-color: var(--warning-light);
    color: var(--warning-darker);
  }
  &.tds-label-error {
    background-color: var(--error-light);
    color: var(--error-darker);
  }
}

/* TEXT BADGES */
.tds-badge {
  background-color: var(--base-darker);
  border-radius: var(--space-m);
  color: var(--base-lighter);
  display: inline-block;
  min-width: calc(1em + var(--space-s) * 2);
  padding: 0 var(--space-s);
  text-align: center;
  &.tds-badge-primary {
    background-color: var(--primary-darker);
    color: var(--primary-lighter);
  }
  &.tds-badge-success {
    background-color: var(--success-darker);
    color: var(--success-lighter);
  }
}

/* TEXT PANELS */
.tds-panel {
  background-color: var(--base-lightest);
  border: var(--border-default);
  padding: var(--space-m);
  position: relative;
  margin-bottom: var(--space-s);
  & > i {
    font-size: 125%;
    left: var(--space-m);
    position: absolute;
    top: var(--space-m);
  }
  & > p {
    margin: 0 0 var(--space-m) var(--space-xl);
    &:last-child {
      margin-bottom: 0;
    }
  }
  &.tds-panel-info {
    background-color: var(--info-lighter);
    border-color: var(--info-darker);
    color: var(--info-darker);
  }
  &.tds-panel-warning {
    background-color: var(--warning-lighter);
    border-color: var(--warning-darker);
    color: var(--warning-darker);
  }
  &.tds-panel-error {
    background-color: var(--error-lighter);
    border-color: var(--error-darker);
    color: var(--error-darker);
  }
}

/* UTILITIES */
.hide {
  display: none;
}
.screen-reader-only {
  border: 0;
  clip: rect(1px, 1px, 1px, 1px);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  word-wrap: normal;
}
.full-height {
  height: 100%;
}
.full-width {
  width: 100%;
}
.float-left {
  float: left;
}
.float-right {
  float: right;
}
.text-left {
  text-align: left;
}
.text-center {
  text-align: center;
}
.text-right {
  text-align: right;
}
.flex-container-row {
  display: flex;
  flex-direction: row;
  min-height: 0;
  min-width: 0;
  & > .flex-cross-scroll {
    flex: var(--flex-fill);
    max-height: 100%;
    overflow: hidden auto;
  }
}
.flex-container-column {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  & > .flex-cross-scroll {
    flex: var(--flex-fill);
    max-width: 100%;
    overflow: auto hidden;
  }
}
.flex-1 {
  flex: var(--flex-1);
}
.flex-2 {
  flex: var(--flex-2);
}
.flex-3 {
  flex: var(--flex-3);
}
.flex-4 {
  flex: var(--flex-4);
}
.flex-5 {
  flex: var(--flex-5);
}
.flex-6 {
  flex: var(--flex-6);
}
.flex-7 {
  flex: var(--flex-7);
}
.flex-8 {
  flex: var(--flex-8);
}
.flex-9 {
  flex: var(--flex-9);
}
.flex-10 {
  flex: var(--flex-10);
}
.flex-11 {
  flex: var(--flex-11);
}
.flex-12 {
  flex: var(--flex-12);
}
.flex-fill {
  flex: var(--flex-fill);
}

.shadow-0 {
  box-shadow: var(--shadow-0);
}
.shadow-1 {
  box-shadow: var(--shadow-1);
}
.shadow-2 {
  box-shadow: var(--shadow-2);
}
.shadow-3 {
  box-shadow: var(--shadow-3);
}
.shadow-4 {
  box-shadow: var(--shadow-4);
}
.shadow-5 {
  box-shadow: var(--shadow-5);
}

/* BORDERS */
.bt {
  border-top: var(--border-default);
}
.bl {
  border-left: var(--border-default);
}
.bb {
  border-bottom: var(--border-default);
}
.br {
  border-right: var(--border-default);
}


/* PADDING */
.p-xs {
  padding: var(--space-xs);
}
.p-s {
  padding: var(--space-s);
}
.p-m {
  padding: var(--space-m);
}
.p-l {
  padding: var(--space-l);
}
.p-xl {
  padding: var(--space-xl);
}

.px-xs {
  padding: 0 var(--space-xs);
}
.px-s {
  padding: 0 var(--space-s);
}
.px-m {
  padding: 0 var(--space-m);
}
.px-l {
  padding: 0 var(--space-l);
}
.px-xl {
  padding: 0 var(--space-xl);
}

.py-xs {
  padding: var(--space-xs) 0;
}
.py-s {
  padding: var(--space-s) 0;
}
.py-m {
  padding: var(--space-m) 0;
}
.py-l {
  padding: var(--space-l) 0;
}
.py-xl {
  padding: var(--space-xl) 0;
}

.mx-m {
  margin-left: var(--space-m);
  margin-right: var(--space-m);
}

.my-m {
  margin-top: var(--space-m);
  margin-bottom: var(--space-m);
}

.mt-m {
  margin-top: var(--space-m);
}
.mt-xl {
  margin-top: var(--space-xl);
}
.ml-s {
  margin-left: var(--space-s);
}
.ml-m {
  margin-left: var(--space-m);
}
.ml-xl {
  margin-left: var(--space-xl);
}
.mb-s {
  margin-bottom: var(--space-s);
}
.mb-m {
  margin-bottom: var(--space-m);
}
.mb-xl {
  margin-bottom: var(--space-xl);
}
.mr-xl {
  margin-right: var(--space-xl);
}

/* FORMS: CHECKBOX, RADIO, TOGGLE */
.tds-checkbox {
  cursor: pointer;
  vertical-align: middle;
  & > input[type="checkbox"] {
    appearance: none;
    cursor: pointer;
    outline: none;
    position: relative;
    vertical-align: middle;
    &:after {
      background-color: var(--white);
      border: var(--border-default);
      border-radius: var(--space-s);
      color: var(--base-dark);
      content: ' ';
      display: inline-block;
      font-family: var(--font-family-fa);
      font-size: var(--font-size-m);
      font-weight: var(--font-weight-fa);
      height: var(--font-size-l);
      line-height: var(--font-size-l);
      text-align: center;
      transition: var(--transition-short);
      vertical-align: middle;
      width: var(--font-size-l);
    }
    &:checked:after {
      content: '\f00c';
    }
    &:indeterminate:after {
      content: '\f068';
    }
    &:focus:after {
      box-shadow: var(--shadow-outline);
    }
    &:disabled:after {
      background-color: var(--disabled-light);
      border-color: var(--disabled-dark);
      color: var(--disabled-dark);
      cursor: not-allowed;
    }
  }
  &:hover > input[type="checkbox"]:not(:disabled):after {
    border-color: var(--base-darkest);
    color: var(--base-darkest);
  }
  & > span {
    padding-left: var(--space-s);
    vertical-align: middle;
  }
}

.tds-radio {
  cursor: pointer;
  vertical-align: middle;
  & > input[type="radio"] {
    appearance: none;
    cursor: pointer;
    outline: none;
    position: relative;
    vertical-align: middle;
    &:after {
      background-color: var(--white);
      border: var(--border-default);
      border-radius: 50%;
      color: var(--base-dark);
      content: ' ';
      display: inline-block;
      font-family: var(--font-family-fa);
      font-size: calc(var(--font-size-l) - 8px);
      font-weight: var(--font-weight-fa);
      height: var(--font-size-l);
      line-height: calc(var(--font-size-l) - 2px);
      text-align: center;
      text-rendering: geometricPrecision;
      transition: var(--transition-short);
      vertical-align: middle;
      width: var(--font-size-l);
    }
    &:checked:after {
      content: '\f111';
    }
    &:focus:after {
      box-shadow: var(--shadow-outline);
    }
    &:disabled:after {
      background-color: var(--disabled-light);
      border-color: var(--disabled-dark);
      color: var(--disabled-dark);
      cursor: not-allowed;
    }
  }
  &:hover > input[type="radio"]:not(:disabled):after {
    border-color: var(--base-darkest);
    color: var(--base-darkest);
  }
  & > span {
    display: inline-block;
    padding-left: var(--space-s);
    vertical-align: middle;
    & > small {
      font-weight: var(--font-weight-normal);
    }
  }
}

.tds-toggle {
  cursor: pointer;
  vertical-align: middle;
  & > input[type="checkbox"] {
    appearance: none;
    background-color: var(--white);
    border-radius: 1em;
    border: var(--border-default);
    box-shadow: inset -2em 0 0 0 var(--base);
    cursor: pointer;
    height: 2em;
    margin: 0;
    outline: none;
    position: relative;
    transition: var(--transition-short);
    vertical-align: middle;
    width: 4em;
    &:checked {
      border-color: var(--success-dark);
      box-shadow: inset 2em 0 0 0 var(--success);
    }
    &:disabled {
      background-color: var(--disabled-light);
      border-color: var(--disabled-dark);
      box-shadow: inset -2em 0 0 0 var(--disabled);
      cursor: not-allowed;
    }
    &:disabled:checked {
      box-shadow: inset 2em 0 0 0 var(--disabled);
    }
  }
  &:hover > input[type="checkbox"]:not(:disabled) {
    box-shadow: inset -2em 0 0 0 var(--base-light);
  }
  &:hover > input[type="checkbox"]:not(:disabled):checked {
    border-color: var(--success);
    box-shadow: inset 2em 0 0 0 var(--success-light);
  }
  & > span {
    vertical-align: middle;
  }
  & > span + input[type="checkbox"] {
    margin-left: var(--space-s);
  }
  & > input[type="checkbox"] + span {
    padding-left: var(--space-s);
  }
}

/* BUTTONS */
button {
  background-color: var(--white);
  border: var(--border-default);
  border-radius: var(--space-s);
  color: var(--ink);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size-xl);
  padding: var(--space-s) var(--space-m);
  transition: border-color var(--transition-short);
  &:not(:disabled) {
    box-shadow: var(--shadow-2);
    &:hover {
      border-color: var(--base-darkest);
    }
  }
  &:focus {
    box-shadow: var(--shadow-outline);
  }
  &.tds-button-primary {
    background-color: var(--primary-light);
    border-color: var(--primary-darker);
    color: var(--primary-darker);
  }
  &.tds-button-secondary {
    background-color: transparent;
    border: 0;
    &:not(:disabled):hover {
      background-color: var(--base-lighter);
    }
    &:disabled {
      background-color: transparent;
      color: var(--disabled-dark);
    }
  }
  &.tds-button-success {
    background-color: var(--success-light);
    border-color: var(--success-darker);
    color: var(--success-darker);
  }
  &.tds-button-warning {
    background-color: var(--warning-light);
    border-color: var(--warning-darker);
    color: var(--warning-darker);
  }
  &.invalid {
    border-color: var(--error);
    &:not(:disabled):hover {
      border-color: var(--error-dark);
    }
  }
  &:disabled {
    background-color: var(--disabled-light);
    border-color: var(--disabled-dark);
    color: var(--disabled-dark);
    cursor: not-allowed;
  }
}

/* FORMS */
fieldset {
  border: var(--border-default);
  & > legend {
    & > .number-icon {
      background-color: var(--white);
      border: var(--border-default);
      border-radius: 50%;
      color: var(--ink);
      display: inline-block;
      font-size: var(--font-size-l);
      font-weight: var(--font-weight-bold);
      height: calc(var(--font-size-l) * 1.25);
      line-height: calc(var(--font-size-l) - 2px);
      margin-right: var(--space-xs);
      padding: var(--space-xs);
      text-align: center;
      vertical-align: middle;
      width: calc(var(--font-size-l) * 1.25);
    }
  }
  & > .flex-container-row {
    padding: var(--space-m) var(--space-m) 0 var(--space-m);
    & > .form-group {
      padding: 0 var(--space-l);
    }
  }
}
input[type="text"],
textarea {
  border: var(--border-default);
  border-radius: var(--space-s);
  font-family: var(--font-family);
  padding: var(--space-s) var(--space-m);
  &:disabled {
    background-color: var(--disabled-light);
    border-color: var(--disabled-dark);
    color: var(--disabled-dark);
    cursor: not-allowed;
  }
  &:not(:disabled):hover {
    border-color: var(--base-darkest);
  }
  &:focus {
    box-shadow: var(--shadow-outline);
  }
  &.invalid {
    border-color: var(--error);
    &:not(:disabled):hover {
      border-color: var(--error-dark);
    }
  }
}
textarea {
  resize: none;
}
select {
  background-color: var(--base-lightest);
  display: block;
  font-family: var(--font-family);
  font-size: var(--font-size-xl);
  padding: var(--space-s) var(--space-m);
  width: 100%;
}
label {
  font-weight: var(--font-weight-bold);
  vertical-align: middle;
  & > span {
    display: inline-block;
    margin-bottom: var(--space-s);
  }
}
.form-group {
  margin-bottom: var(--space-l);
  & > strong {
    display: inline-block;
    margin-bottom: var(--space-s);
  }
}
</style>
