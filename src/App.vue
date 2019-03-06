<template>
  <div id="app">
    <header>
      <div id="site_brand" class="header-hover-link" @click="$router.push({name: 'home'})">
        <div id="logo_wrapper">
          <img id="logo" alt="flashcrow" src="./assets/logo.png" width="32" height="32">
        </div>
        <div id="site_name">flashcrow</div>
      </div>
      <nav>
        <div id="nav_bar">
          <router-link class="nav-link" :to="{ name: 'home' }">View Data</router-link>
          <template v-if="auth.loggedIn">
            <router-link class="nav-link" :to="{ name: 'runWarrant' }">Run Warrant</router-link>
          </template>
        </div>
        <div id="user_dropdown" class="header-hover-link">
          <div class="user-name text-ellipsis">Guest</div>
          <div class="user-pic">&nbsp;</div>
          <ul>
            <li>
              <a href="/flashcrow/api/auth/openid-connect">Sign In</a>
            </li>
            <li>
              <router-link :to="{ name: 'privacyPolicy' }">Privacy Policy</router-link>
            </li>
            <li>
              <router-link :to="{ name: 'termsOfService' }">Terms of Service</router-link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <main>
      <router-view/>
    </main>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'App',
  computed: {
    ...mapState(['auth']),
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
.card {
  box-shadow: 0 3px 6px 0 #00000033;
  margin: 8px;
}
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
}
header {
  align-items: center;
  background-color: #e7e7e7;
  display: flex;
  flex-direction: row;
  height: 48px;
  min-height: 48px;
  #site_brand {
    align-items: center;
    display: flex;
    flex-direction: row;
    height: 48px;
    padding: 8px;
    #logo_wrapper {
      display: inline-block;
      margin-right: 8px;
    }
    #site_name {
      display: inline-block;
      font-size: 24px;
    }
  }
  nav {
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    text-align: right;
    #nav_bar {
      flex-grow: 1;
      a.nav-link {
        font-weight: bold;
        padding-right: 32px;
        color: #2c3e50;
        &.router-link-exact-active {
          color: #42b983;
        }
      }
    }
    #user_dropdown {
      align-items: center;
      display: flex;
      height: 48px;
      padding: 8px;
      position: relative;
      .user-name {
        display: inline-block;
        font-size: 18px;
        width: 94px;
      }
      .user-pic {
        background-color: white;
        border-radius: 16px;
        display: inline-block;
        height: 32px;
        margin-left: 8px;
        width: 32px;
      }
      ul {
        background-color: #f7f7f7;
        display: none;
        list-style: none;
        margin: 0;
        padding: 0;
        position: absolute;
        right: 0;
        top: 100%;
        & > li {
          padding: 8px 8px;
          transition: background-color 100ms ease-in-out;
          width: 150px;
          &:hover {
            background-color: #eee;
          }
        }
      }
      &:hover > ul {
        display: block;
      }
    }
  }
  .header-hover-link {
    cursor: pointer;
    transition: background-color 100ms ease-in-out;
    &:hover {
      background-color: #ddd;
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
main {
  flex-grow: 1;
  padding: 8px;
}
.main {
  height: 100%;
}
</style>
