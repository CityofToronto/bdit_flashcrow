<template>
  <div class="container full-screen">
    <div class="hide">
      <form
        v-if="auth.loggedIn"
        ref="formSignOut"
        method="POST"
        action="/flashcrow/api/auth/logout"></form>
    </div>
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
               :to="{name: 'home'}">
               View Data
            </router-link>
          </li>
          <li class="flex-grow text-right">
            <a href="javascript:void(0);" @click="profileComingSoon">
              <span>Profile</span>
              <svg class="icon-profile" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 31.66 31.66"><path d="M15.83,15.83a3.4,3.4,0,1,1,3.39-3.39A3.39,3.39,0,0,1,15.83,15.83Zm0-9a5.66,5.66,0,1,0,5.65,5.66A5.65,5.65,0,0,0,15.83,6.78Z"/><path d="M25.28,25.53a1.55,1.55,0,0,0-.25-.61,10.33,10.33,0,0,0-18.25-.23,5.9,5.9,0,0,0-.34.82,13.57,13.57,0,1,1,19,0ZM8.14,27a10.06,10.06,0,0,1,.5-1.22A8.09,8.09,0,0,1,23,26c.16.34.29.7.43,1.06A13.58,13.58,0,0,1,8.14,27ZM15.83,0A15.83,15.83,0,1,0,31.66,15.83,15.83,15.83,0,0,0,15.83,0Z"/></svg>
            </a>
          </li>
        </ul>
      </nav>
    </div>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
/* eslint-disable no-alert */
import { mapState } from 'vuex';

import 'mapbox-gl/dist/mapbox-gl.css';

import SearchBarLocation from '@/components/SearchBarLocation.vue';

export default {
  name: 'App',
  components: {
    SearchBarLocation,
  },
  computed: {
    username() {
      if (this.auth.loggedIn) {
        return this.auth.user.email;
      }
      return 'Guest';
    },
    ...mapState(['auth']),
  },
  methods: {
    profileComingSoon() {
      window.alert('Coming soon: user profiles!');
    },
    signOut() {
      this.$refs.formSignOut.submit();
    },
  },
};
</script>

<style lang="postcss">
:root {
  --white: #fff;
  --off-white: #fafafa;
  --outline-grey: #c7c7c7;
  --outline-grey-focus: #7f7f7f;
  --black: #000;
  --off-black: #1c2833;
  --blue: #1460aa;
  --green: #1d781d;
  --red: #b50000;
  --yellow: #634806;
  --light-blue: #a9cff4;
  --light-green: #a7e9a7;
  --light-red: #ff9c9c;
  --light-yellow: #f9dd98;
  --text-sm: 1.2rem;
  --text-md: 1.4rem;
  --text-lg: 1.6rem;
  --text-xl: 1.8rem;
  --text-xxl: 2.4rem;
  --font-family: 'Work Sans', Helvetica, Arial, sans-serif;
  --font-normal: 400;
  --font-bold: 600;
  --sp: 0.4rem;
  --transition-short: .15s;
}

* {
  box-sizing: border-box;
}

html, body {
  background-color: var(--off-white);
  font-family: var(--font-family);
  font-weight: var(--font-normal);
  margin: 0;
  min-height: 100vh;
  padding: 0;
}
html {
  font-size: 62.5%;
}
body {
  font-size: var(--text-md);
}
.full-screen {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  padding: 0;
  & > main {
    flex-grow: 1;
  }
}
h1, h2, h3 {
  font-weight: var(--font-bold);
  margin: 0.75em 0;
  text-transform: uppercase;
}
h1 {
  font-size: var(--text-xxl);
}
h2 {
  font-size: var(--text-xl);
}
h3 {
  font-size: var(--text-lg);
}
p {
  margin: 0.5em 0;
}
strong {
  font-weight: var(--font-bold);
}
button, .btn {
  background-color: var(--white);
  border: 1px solid var(--outline-grey);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--text-xl);
  padding: var(--sp) calc(var(--sp) * 2);
  transition: border-color var(--transition-short) ease-in-out;
  &:hover {
    border-color: var(--outline-grey-focus);
  }
  &.btn-primary {
    background-color: var(--light-blue);
    border-color: var(--blue);
    color: var(--blue);
  }
}
input[type=text] {
  border: 1px solid var(--outline-grey);
  font-family: var(--font-family);
  font-size: var(--text-xl);
  padding: var(--sp) calc(var(--sp) * 2);
  &:hover {
    border-color: var(--outline-grey-focus);
  }
}
input[type=checkbox] {
  height: 1.8rem;
  vertical-align: middle;
  width: 1.8rem;
}
.v-select.form-select {
  background-color: var(--white);
  & input[type=search] {
    font-family: var(--font-family);
    font-size: var(--text-xl);
    margin: 0;
    padding: 0 calc(var(--sp) * 2);
  }
  & .dropdown-toggle {
    border-color: var(--outline-grey);
    border-radius: 0;
    padding-bottom: 2px;
    transition: border-color var(--transition-short) ease-in-out;
    &::after {
      display: none;
    }
  }
  &:hover .dropdown-toggle {
    border-color: var(--outline-grey-focus);
  }
}
label {
  font-weight: var(--font-bold);
  vertical-align: middle;
}
.input-group {
  & > * {
    border: 1px solid var(--outline-grey);
    transition: border-color var(--transition-short) ease-in-out;
    vertical-align: middle;
  }
  &:hover > * {
    border-color: var(--outline-grey-focus);
  }
  & > img {
    background-color: var(--white);
    height: 31px;
  }
  & > :last-child {
    border-left: none;
  }
}
.form-group {
  font-size: var(--text-lg);
}
.flex-grow {
  flex-grow: 1;
}
.text-center {
  text-align: center;
}
.text-right {
  text-align: right;
}
.nav-bar {
  align-items: center;
  border-bottom: 1px solid var(--outline-grey);
  display: flex;
  margin-bottom: calc(var(--sp) * 2);
  & > .nav-brand {
    align-items: center;
    display: flex;
    & > img {
      margin: calc(var(--sp) * 2);
    }
    & > span {
      font-size: var(--text-lg);
      font-weight: var(--font-bold);
    }
  }
  & > .nav-search {
    margin-left: calc(var(--sp) * 4);
  }
  & > nav {
    flex-grow: 1;
    & > ul {
      align-items: stretch;
      display: flex;
      list-style: none;
      margin-block-start: 0;
      margin-block-end: 0;
      padding-inline-start: calc(var(--sp) * 4);
      & > li {
        font-size: var(--text-xl);
        & > * {
          vertical-align: middle;
        }
        & > a {
          border-bottom: 2px solid var(--off-white);
          color: var(--off-black);
          display: inline-block;
          height: calc(var(--sp) * 12);
          line-height: calc(var(--sp) * 8);
          padding: calc(var(--sp) * 2);
          text-decoration: none;
          & > * {
            vertical-align: middle;
          }
          & > svg {
            margin-left: calc(var(--sp) * 2);
          }
          &:hover {
            background-color: var(--light-blue);
            border-color: var(--blue);
            color: var(--blue);
          }
          &.router-link-active,
          &.router-link-active:hover {
            background-color: var(--light-green);
            border-color: var(--green);
            color: var(--green);
          }
        }
      }
    }
  }
}
.open-indicator {
  margin-right: 8px;
  .v-select:hover &::before {
    color: black;
  }
}
.d-block, th[role=columnheader] {
  font-weight: 500;
}
.icon-profile {
  cursor: pointer;
  stroke: none;
  fill: var(--off-black);
  transition: fill .15s ease-in-out;
  a:hover & {
    fill: var(--blue);
  }
}
</style>
