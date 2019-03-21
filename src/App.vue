<template>
  <b-container fluid id="app">
    <div class="d-none">
      <form
        v-if="auth.loggedIn"
        ref="formSignOut"
        method="POST"
        action="/flashcrow/api/auth/logout"></form>
    </div>
    <b-navbar toggleable="md" type="dark" variant="info">
      <b-navbar-brand>flashcrow</b-navbar-brand>
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
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  margin: 0;
  min-height: 100vh;
  padding: 0;
}
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
  padding: 0;
}
#row_main {
  flex-grow: 1;
}
.main {
  height: 100%;
}
</style>
