import Vue from 'vue';
import Router from 'vue-router';

import store from '@/store';

Vue.use(Router);

const NAME_HOME = 'home';

const router = new Router({
  routes: [
    {
      path: '/view',
      name: NAME_HOME,
      component: () => import(/* webpackChunkName: "home" */ './views/ViewExplore.vue'),
    },
    {
      path: '/view/:query',
      name: 'viewQuery',
      component: () => import(/* webpackChunkName: "home" */ './views/ViewQuery.vue'),
    },
    {
      path: '/requests/new/request',
      name: 'requestsNewRequest',
      component: () => import(/* webpackChunkName: "home" */ './views/RequestsNewRequest.vue'),
    },
    {
      path: '/requests/new/schedule',
      name: 'requestsNewSchedule',
      component: () => import(/* webpackChunkName: "home" */ './views/RequestsNewSchedule.vue'),
    },
    {
      path: '/requests/new/confirm',
      name: 'requestsNewConfirm',
      component: () => import(/* webpackChunkName: "home" */ './views/RequestsNewConfirm.vue'),
    },
  ],
});

function routeMetaAuth(route) {
  if (route.meta && Object.prototype.hasOwnProperty.call(route.meta, 'auth')) {
    return route.meta.auth;
  }
  return { mode: 'try' };
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
