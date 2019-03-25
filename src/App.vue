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
      <b-navbar-toggle target="nav_collapse" />
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown :text="username" right>
            <b-dropdown-item-button
              v-if="auth.loggedIn"
              @click="signOut">Sign Out</b-dropdown-item-button>
            <b-dropdown-item
              v-else
              href="/flashcrow/api/auth/openid-connect">Sign In</b-dropdown-item>
            <li class="separator" />
            <b-dropdown-item :to="{ name: 'privacyPolicy' }">
              Privacy Policy
            </b-dropdown-item>
            <b-dropdown-item :to="{ name: 'termsOfService' }">
              Terms of Service
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-row no-gutters id="row_main">
      <b-col>
        <router-view/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapState } from 'vuex';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'mapbox-gl/dist/mapbox-gl.css';

export default {
  name: 'App',
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
  padding: 8px 40px;
}
#row_main {
  flex-grow: 1;
}
.main {
  height: 100%;
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
</style>
