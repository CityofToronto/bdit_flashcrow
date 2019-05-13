<template>
  <div class="container full-screen">
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
    <div class="nav-bar">
      <div class="nav-brand">
        <img
          class="icon-logo"
          src="/flashcrow/icons/logo-icon.svg"
          width="20"
          height="24"
          alt="flashcrow" />
        <span>flashcrow</span>
      </div>
      <div class="nav-search">
        <search-bar-location />
      </div>
      <nav>
        <ul>
          <li>
            <router-link
              v-if="location !== null"
              :to="{name: 'viewQuery', params: { query: location.geoId }}">
               <span>View Data </span>
               <i class="fa fa-search"></i>
            </router-link>
            <a v-else disabled>
              <span>View Data </span>
              <i class="fa fa-search"></i>
            </a>
          </li>
          <li class="flex-fill text-right">
            <a href="javascript:void(0);" @click="profileComingSoon">
              <span>Welcome, Chris!</span>
              <svg class="icon-profile" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 31.66 31.66"><path d="M15.83,15.83a3.4,3.4,0,1,1,3.39-3.39A3.39,3.39,0,0,1,15.83,15.83Zm0-9a5.66,5.66,0,1,0,5.65,5.66A5.65,5.65,0,0,0,15.83,6.78Z"/><path d="M25.28,25.53a1.55,1.55,0,0,0-.25-.61,10.33,10.33,0,0,0-18.25-.23,5.9,5.9,0,0,0-.34.82,13.57,13.57,0,1,1,19,0ZM8.14,27a10.06,10.06,0,0,1,.5-1.22A8.09,8.09,0,0,1,23,26c.16.34.29.7.43,1.06A13.58,13.58,0,0,1,8.14,27ZM15.83,0A15.83,15.83,0,1,0,31.66,15.83,15.83,15.83,0,0,0,15.83,0Z"/></svg>
            </a>
          </li>
        </ul>
      </nav>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import 'mapbox-gl/dist/mapbox-gl.css';
import 'v-calendar/lib/v-calendar.min.css';

import ModalComingSoon from '@/components/ModalComingSoon.vue';
import ModalRequestsNewConfirmation from '@/components/ModalRequestsNewConfirmation.vue';
import SearchBarLocation from '@/components/SearchBarLocation.vue';

export default {
  name: 'App',
  components: {
    ModalComingSoon,
    ModalRequestsNewConfirmation,
    SearchBarLocation,
  },
  computed: {
    username() {
      if (this.auth.loggedIn) {
        return this.auth.user.email;
      }
      return 'Guest';
    },
    ...mapState(['auth', 'modal', 'location']),
  },
  methods: {
    onModalToggle() {
      if (!this.$refs.modalToggle.checked) {
        this.clearModal();
      }
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
/* THEME */
:root {
  --white: #fff;
  --base-lightest: #f0f0f0;  /* gray-5 */
  --base-lighter: #dcdee0;  /* gray-cool-10 */
  --base-light: #a9aeb1;  /* gray-cool-30 */
  --base: #71767a;  /* gray-cool-50 */
  --base-dark: #565c65;  /* gray-cool-60 */
  --base-darker: #3d4551;  /* gray-cool-70 */
  --base-darkest: #1b1b1b;  /* gray-90 */
  --ink: #1b1b1b;  /* gray-90 */

  --modal-backdrop: #1b1b1b99;

  --primary-lighter: #d9e8f6;  /* blue-10 */
  --primary-light: #73b3e7;  /* blue-30 */
  --primary: #005ea2;  /* blue-60v */
  --primary-vivid: #0050d8;  /* blue-warm-60v */
  --primary-dark: #1a4480;  /* blue-warm-70v */
  --primary-darker: #162e51;  /* blue-warm-80v */

  --info-lighter: #e7f6f8;  /* cyan-5 */
  --info-light: #9ddfeb;  /* cyan-20 */
  --info: #00bde3;  /* cyan-30v */
  --info-dark: #009ec1;  /* cyan-40v */
  --info-darker: #2e6276;  /* blue-cool-60 */

  --error-lighter: #f4e3db;  /* red-warm-10 */
  --error-light: #f39268;  /* red-warm-30v */
  --error: #d63e04;  /* red-warm-50v */
  --error-dark: #b51d09;  /* red-60v */
  --error-darker: #6f3331;  /* red-70 */

  --warning-lighter: #faf3d1;  /* yellow-5 */
  --warning-light: #fee685;  /* yellow-10v */
  --warning: #ffbe2e;  /* gold-20v */
  --warning-dark: #e5a000;  /* gold-30v */
  --warning-darker: #936f38;  /* gold-50v */

  --success-lighter: #ecf3ec;  /* green-cool-5 */
  --success-light: #70e17b;  /* green-cool-20v */
  --success: #00a91c;  /* green-cool-40v */
  --success-dark: #4d8055;  /* green-cool-50 */
  --success-darker: #446443;  /* green-cool-60 */

  --disabled-light: #e6e6e6;  /* gray-10 */
  --disabled: #c9c9c9;  /* gray-20 */
  --disabled-dark: #adadad;  /* gray-30 */

  --font-family: 'Work Sans', Roboto, Helvetica, sans-serif;
  --font-family-fa: 'Font Awesome 5 Free';

  --font-size-xs: 0.75rem;
  --font-size-s: 0.875rem;
  --font-size-m: 1rem;  /* 16px */
  --font-size-l: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;

  --font-weight-normal: 400;
  --font-weight-bold: 700;
  --font-weight-fa: 900;

  --space-xs: 0.125rem;
  --space-s: 0.25rem;
  --space-m: 0.5rem;  /* 8px */
  --space-l: 1rem;
  --space-xl: 2rem;
  --space-2xl: 4rem;

  --border-default: 1px solid var(--base);

  --flex-1: 1 0 0;
  --flex-2: 2 0 0;
  --flex-3: 3 0 0;
  --flex-4: 4 0 0;
  --flex-5: 5 0 0;
  --flex-6: 6 0 0;
  --flex-7: 7 0 0;
  --flex-8: 8 0 0;
  --flex-9: 9 0 0;
  --flex-10: 10 0 0;
  --flex-11: 11 0 0;
  --flex-12: 12 0 0;
  --flex-fill: 1 0 0;

  --shadow-0: 0;
  --shadow-1: 0 1px 4px 0 rgba(0, 0, 0, 0.1);
  --shadow-2: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
  --shadow-3: 0 8px 16px 0 rgba(0, 0, 0, 0.1);
  --shadow-4: 0 12px 24px 0 rgba(0, 0, 0, 0.1);
  --shadow-5: 0 16px 32px 0 rgba(0, 0, 0, 0.1);

  --transition-short: .15s ease-in-out;

  --z-index-controls: 99;
  --z-index-modal-backdrop: 1000;
  --z-index-modal-content: 1001;
}

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
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
  padding: 0;
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
small {
  color: var(--base-darker);
}
p {
  margin: var(--space-m) 0;
}

/* UTILITIES */
.hide {
  display: none;
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

/* TYPOGRAPHY */
.panel {
  background-color: var(--base-lightest);
  border: 1px solid var(--base);
  padding: var(--space-m);
  &.panel-info {
    background-color: var(--info-lighter);
    border-color: var(--info-darker);
    color: var(--info-darker);
  }
  &.panel-warning {
    background-color: var(--warning-lighter);
    border-color: var(--warning-darker);
    color: var(--warning-darker);
  }
  &.panel-error {
    background-color: var(--error-lighter);
    border-color: var(--error-darker);
    color: var(--error-darker);
  }
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
      border: 1px solid var(--base-darker);
      border-radius: var(--space-s);
      color: var(--base-darker);
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
      box-shadow: 0 0 0 3px var(--primary-light);
    }
    &:disabled:after {
      background-color: var(--disabled-light);
      border-color: var(--disabled-dark);
      color: var(--disabled-dark);
      cursor: not-allowed;
    }
  }
  &:hover > input[type="checkbox"]:not(:disabled):after {
    border-color: var(--base-darker);
    color: var(--base-darkest);
  }
  & > span {
    padding-left: var(--space-s);
    vertical-align: middle;
  }
}

.tds-toggle {
  cursor: pointer;
  vertical-align: middle;
  & > input[type="checkbox"] {
    appearance: none;
    background-color: var(--white);
    border-radius: 1em;
    border: 1px solid var(--base-dark);
    box-shadow: inset -2em 0 0 0 var(--base);
    cursor: pointer;
    height: 2em;
    outline: none;
    position: relative;
    transition: var(--transition-short);
    vertical-align: middle;
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
    border-color: var(--base);
    box-shadow: inset -2em 0 0 0 var(--base-light);
  }
  &:hover > input[type="checkbox"]:not(:disabled):checked {
    border-color: var(--success);
    box-shadow: inset 2em 0 0 0 var(--success-light);
  }
  & > span {
    padding-left: var(--space-s);
    vertical-align: middle;
  }
}

/* FORMS */
fieldset {
  border: var(--border-default);
}
.details {
  padding: 0;
  margin: 0;
  & > legend {
    margin-left: var(--space-l);
    padding: 0 var(--space-s);
  }
  & > .details-body {
    align-items: flex-start;
    display: flex;
    flex-direction: row;
    margin-bottom: var(--space-l);
    padding: 0 var(--space-l);
    & > .details-column {
      flex: 0 0 33.3333%;
      padding: 0 var(--space-l);
      & .details-checks {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        .label-vertical {
          text-align: center;
          margin: 0 var(--space-s);
          & > input {
            display: block;
          }
        }
      }
      & .details-radios {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
        & > label {
          margin: var(--space-m) 0;
        }
      }
    }
  }
}
button, .btn {
  background-color: var(--base-lightest);
  border: var(--border-default);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size-xl);
  padding: var(--space-s) var(--space-m);
  transition: border-color var(--transition-short);
  &:hover {
    border-color: var(--base-darkest);
  }
  &.btn-primary {
    background-color: var(--primary-light);
    border-color: var(--primary-darker);
    color: var(--primary-darker);
  }
  &.btn-success {
    background-color: var(--success-light);
    border-color: var(--success-darker);
    color: var(--success-darker);
  }
  &.btn-warning {
    background-color: var(--warning-light);
    border-color: var(--warning-darker);
    color: var(--warning-darker);
  }
}
input[type=date],
input[type=input],
input[type=text],
textarea {
  border: var(--border-default);
  font-family: var(--font-family);
  font-size: var(--font-size-xl);
  padding: var(--space-s) var(--space-m);
  &:hover {
    border-color: var(--base-darkest);
  }
}
textarea {
  font-size: var(--font-size-l);
  resize: none;
  width: 100%;
}
select {
  background-color: var(--base-lightest);
  display: block;
  font-family: var(--font-family);
  font-size: var(--font-size-xl);
  padding: var(--space-s) var(--space-m);
  width: 100%;
}
.v-select.form-select {
  background-color: var(--base-lightest);
  font-family: var(--font-family);
  font-size: var(--font-size-xl);
  & input[type=search] {
    font-family: var(--font-family);
    margin: 0;
    padding: 0 var(--space-m);
  }
}
label {
  font-weight: var(--font-weight-bold);
  vertical-align: middle;
}
.input-group {
  & > .input-group-icon {
    background-color: var(--base-lightest);
    border: var(--border-default);
    border-right: none;
    font-size: var(--font-size-xl);
    height: 31px;
    padding: var(--space-s) var(--space-m);
  }
  & > * {
    border: var(--border-default);
    display: inline-block;
    transition: border-color var(--transition-short);
    vertical-align: middle;
  }
  &:hover > * {
    border-color: var(--base-darkest);
  }
  & > img {
    background-color: var(--base-lightest);
    height: 31px;
  }
  & > :last-child {
    border-left: none;
  }
}
.form-group {
  font-size: var(--font-size-m);
  margin-bottom: var(--space-l);
  & > strong {
    display: inline-block;
    margin-bottom: var(--space-m);
  }
  &.size-lg {
    font-size: var(--font-size-l);
  }
  & > label > div,
  & > label > input[type=text] {
    display: block;
    margin: var(--space-s) 0;
    width: 100%;
  }
  & > label > input[type=checkbox],
  & > label > input[type=radio] {
    display: inline-block;
  }
}

/* VALIDATION */
.validation-error {
  color: var(--error-darker);
}

/* NAVIGATION BAR */
.nav-bar {
  align-items: center;
  border-bottom: var(--border-default);
  display: flex;
  margin-bottom: var(--space-m);
  padding: 0 var(--space-xl);
  & > .nav-brand {
    align-items: center;
    display: flex;
    & > img {
      margin: var(--space-m);
    }
    & > span {
      font-size: var(--font-size-l);
      font-weight: var(--font-weight-bold);
    }
  }
  & > .nav-search {
    margin-left: var(--space-l);
  }
  & > nav {
    flex: 1;
    & > ul {
      align-items: stretch;
      display: flex;
      list-style: none;
      margin-block-start: 0;
      margin-block-end: 0;
      padding-inline-start: var(--space-l);
      & > li {
        font-size: var(--font-size-xl);
        & > * {
          vertical-align: middle;
        }
        & > a {
          border-bottom: 2px solid var(--base-lightest);
          color: var(--base-darkest);
          display: inline-block;
          height: calc(var(--space-xl) * 1.5);
          line-height: var(--space-xl);
          padding: var(--space-m);
          text-decoration: none;
          &[disabled], &[disabled]:hover {
            background-color: transparent;
            border: none;
            color: var(--disabled);
            cursor: not-allowed;
          }
          & > * {
            vertical-align: middle;
          }
          & > svg {
            display: inline-block;
            margin-left: var(--space-m);
          }
          &:hover {
            background-color: var(--primary-light);
            border-color: var(--primary-darker);
            color: var(--primary-darker);
            & > svg {
              fill: var(--primary-darker);
            }
          }
          &.router-link-active,
          &.router-link-active:hover {
            background-color: var(--success-light);
            border-color: var(--success-darker);
            color: var(--success-darker);
          }
        }
      }
    }
  }
}

/* ONE-OFF STYLING */
.open-indicator {
  margin-right: 8px;
  .v-select:hover &::before {
    color: black;
  }
}

.link-back {
  font-size: var(--font-size-xl);
  text-transform: uppercase;
}
</style>
