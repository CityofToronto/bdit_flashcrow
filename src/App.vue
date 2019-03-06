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
          <template v-if="auth.loggedIn">
            <div class="user-name text-ellipsis">{{auth.user.email}}</div>
            <div class="user-pic">&nbsp;</div>
          </template>
          <template v-else>
            <div class="user-name text-ellipsis">Guest</div>
            <div class="user-pic">&nbsp;</div>
          </template>
          <ul>
            <li v-if="auth.loggedIn">
              <form id="form_logout" method="POST" action="/flashcrow/api/auth/logout">
                <input id="btn_logout" class="nav-link" type="submit" value="Sign Out">
              </form>
            </li>
            <li v-else>
              <a class="nav-link" href="/flashcrow/api/auth/openid-connect">Sign In</a>
            </li>
            <li class="separator" />
            <li>
              <router-link
                class="nav-link"
                :to="{ name: 'privacyPolicy' }">Privacy Policy</router-link>
            </li>
            <li>
              <router-link
                class="nav-link"
                :to="{ name: 'termsOfService' }">Terms of Service</router-link>
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

import 'mapbox-gl/dist/mapbox-gl.css';

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
.nav-link {
  font-weight: bold;
  color: #2c3e50;
  &.router-link-exact-active {
    color: #42b983;
  }
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
      & > .nav-link {
        margin: 0 16px;
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
        font-size: 16px;
        width: 180px;
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
        z-index: 1000;
        & > li {
          transition: background-color 100ms ease-in-out;
          width: 236px;
          &:hover {
            background-color: #eee;
          }
          &.separator {
            padding: 0;
            border-bottom: 1px solid #e7e7e7;
          }
          & > a {
            display: inline-block;
            height: 100%;
            padding: 8px;
            width: 100%;
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
    height: 100%;
    padding: 8px;
    width: 100%;
    & > #btn_logout {
      background: none;
      border: none;
      cursor: pointer;
      display: inline-block;
      font: inherit;
      font-weight: bold;
      height: 100%;
      text-align: right;
      text-decoration: underline;
      width: 100%;
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
