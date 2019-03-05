<template>
  <div id="app">
    <div id="nav">
      <router-link :to="{ name: 'privacyPolicy' }">Privacy Policy</router-link>
      <span> | </span>
      <router-link :to="{ name: 'termsOfService' }">Terms of Service</router-link>
      <template v-if="auth.loggedIn">
        <span> | </span>
        <router-link :to="{ name: 'home' }">Home</router-link>
        <span> | </span>
        <router-link :to="{ name: 'about' }" id="link_about">About</router-link>
        <span> | </span>
        <form id="form_logout" method="POST" action="/flashcrow/api/auth/logout">
          <input type="submit" id="btn_logout" value="Sign Out" />
        </form>
      </template>
      <template v-else>
        <span> | </span>
        <router-link :to="{ name: 'login' }">Sign In</router-link>
      </template>
    </div>
    <router-view/>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'app',
  computed: {
    ...mapState(['auth']),
  },
};
</script>

<style lang="postcss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
  form#form_logout {
    display: inline-block;
    & > #btn_logout {
      display: inline-block;
      background: none!important;
      color: inherit;
      border: none;
      padding: 0!important;
      font: inherit;
      /*border is optional*/
      border-bottom: 1px solid #444;
      cursor: pointer;
    }
  }
}
</style>
