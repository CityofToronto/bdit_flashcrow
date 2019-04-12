<template>
  <b-container fluid id="app">
    <div class="d-none">
      <form
        v-if="auth.loggedIn"
        ref="formSignOut"
        method="POST"
        action="/flashcrow/api/auth/logout"></form>
    </div>
    <b-navbar id="nav" toggleable="md" type="light">
      <b-img
        class="icon-logo"
        src="/flashcrow/icons/logo-icon.svg"
        width="20"
        height="24"
        alt="flashcrow" />
      <b-navbar-brand :to="{name: 'home'}">
        <strong>flashcrow</strong>
      </b-navbar-brand>
      <search-bar-location />
      <b-navbar-nav class="ml-auto">
        <svg @click="profileComingSoon" class="icon-profile" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 31.66 31.66"><path d="M15.83,15.83a3.4,3.4,0,1,1,3.39-3.39A3.39,3.39,0,0,1,15.83,15.83Zm0-9a5.66,5.66,0,1,0,5.65,5.66A5.65,5.65,0,0,0,15.83,6.78Z"/><path d="M25.28,25.53a1.55,1.55,0,0,0-.25-.61,10.33,10.33,0,0,0-18.25-.23,5.9,5.9,0,0,0-.34.82,13.57,13.57,0,1,1,19,0ZM8.14,27a10.06,10.06,0,0,1,.5-1.22A8.09,8.09,0,0,1,23,26c.16.34.29.7.43,1.06A13.58,13.58,0,0,1,8.14,27ZM15.83,0A15.83,15.83,0,1,0,31.66,15.83,15.83,15.83,0,0,0,15.83,0Z"/></svg>
      </b-navbar-nav>
    </b-navbar>
    <b-row no-gutters id="row_main">
      <b-col>
        <router-view></router-view>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
/* eslint-disable no-alert */
import { mapState } from 'vuex';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
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
* {
  box-sizing: border-box;
}
html, body {
  background-color: #f1f4fe;
  font-family: 'Work Sans', Helvetica, Arial, sans-serif;
  margin: 0;
  min-height: 100vh;
  padding: 0;
}
.icon-logo {
  margin-right: 8px;
}
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  padding: 0;
}
#nav {
  background-color: #fafafa;
}
#row_main {
  flex-grow: 1;
}
strong {
  font-weight: 600;
}
h2 {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1.7px;
  margin-bottom: 22px;
  text-transform: uppercase;
}
h3 {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 22px;
  text-transform: uppercase;
}
.v-select .dropdown-toggle {
  transition: border-color 100ms ease-in-out;
}
.v-select:hover .dropdown-toggle {
  border-color: #8c85db;
}
.open-indicator {
  margin-right: 8px;
  .v-select:hover &::before {
    color: black;
  }
}
.dropdown-toggle::after {
  display: none;
}
.d-block, th[role=columnheader] {
  font-weight: 500;
}
.icon-profile {
  cursor: pointer;
  stroke: none;
  fill: #9b9b9b;
  transition: fill .15s ease-in-out;
  &:hover {
    fill: black;
  }
}
</style>
