<template>
  <div id="app">
    <div id="nav">
      <template v-if="auth.loggedIn">
        <router-link to="/">Home</router-link>
        <span> | </span>
        <router-link to="/about" id="link_about">About</router-link>
        <span> | </span>
        <form id="form_logout" method="POST" action="/flashcrow/api/logout">
          <input type="submit" id="btn_logout" value="Logout" />
        </form>
      </template>
      <h1 v-else>Log In</h1>
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
