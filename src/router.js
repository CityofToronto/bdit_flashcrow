import Vue from 'vue';
import Router from 'vue-router';

import store from '@/store';

Vue.use(Router);

const NAME_HOME = 'home';

const router = new Router({
  routes: [
    // PUBLIC-FACING PAGES
    {
      path: '/privacy-policy',
      name: 'privacyPolicy',
      component: () => import(/* webpackChunkName: "public" */ './views/PrivacyPolicy.vue'),
      meta: {
        auth: { mode: 'try' },
      },
    },
    {
      path: '/terms-of-service',
      name: 'termsOfService',
      component: () => import(/* webpackChunkName: "public" */ './views/TermsOfService.vue'),
      meta: {
        auth: { mode: 'try' },
      },
    },
    {
      path: '/',
      name: NAME_HOME,
      component: () => import(/* webpackChunkName: "home" */ './views/Home.vue'),
      meta: {
        auth: { mode: 'try' },
      },
    },
    // AUTHENTICATED PAGES
    {
      path: '/run-warrant',
      name: 'runWarrant',
      component: () => import(/* webpackChunkName: "warrant" */ './views/RunWarrant.vue'),
    },
  ],
});

function routeMetaAuth(route) {
  if (route.meta && Object.prototype.hasOwnProperty.call(route.meta, 'auth')) {
    return route.meta.auth;
  }
  return true;
}

router.beforeEach((to, from, next) => {
  store.dispatch('checkAuth')
    .then(({ loggedIn }) => {
      if (to.matched.some(route => routeMetaAuth(route) === true)) {
        // this route requires an authenticated user
        if (loggedIn) {
          next();
        } else {
          next({ name: NAME_HOME });
        }
      } else if (to.matched.some(route => routeMetaAuth(route) === false)) {
        // this route requires an unauthenticated user
        if (loggedIn) {
          next({ name: NAME_HOME });
        } else {
          next();
        }
      } else {
        // this route accepts both authenticated and unauthenticated users
        next();
      }
    })
    .catch((err) => {
      next(err);
    });
});

export default router;
