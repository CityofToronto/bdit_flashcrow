<template>
  <div id="app">
    <div id="nav">
      <template v-if="auth.loggedIn">
        <router-link to="/">Home</router-link>
        <span> | </span>
        <router-link to="/about">About</router-link>
        <span> | </span>
        <a href="/flashcrow/api/logout">Logout</a>
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
}
</style>
