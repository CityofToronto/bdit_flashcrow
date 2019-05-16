import Vue from 'vue';
import Router from 'vue-router';

import store from '@/store';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/view',
      name: 'viewData',
      component: () => import(/* webpackChunkName: "home" */ './views/LayoutViewData.vue'),
      children: [{
        path: '',
        components: {
          filters: null,
          display: null,
        },
      }, {
        path: 'location/:keyString',
        name: 'viewDataAtLocation',
        components: {
          filters: () => import(/* webpackChunkName: "home" */ './components/FcFiltersViewDataAtLocation.vue'),
          display: () => import(/* webpackChunkName: "home" */ './components/FcDisplayViewDataAtLocation.vue'),
        },
      }],
    },
    {
      path: '/requests/study/new',
      name: 'requestStudy',
      component: () => import(/* webpackChunkName: "home" */ './views/LayoutRequestStudy.vue'),
      /*
      children: [{
        path: '',
        components: {

        },
      }, {
        path: 'schedule',
        name: 'requestStudySchedule',
        components: {

        },
      }, {
        path: 'confirm',
        name: 'requestStudyConfirm',
        components: {

        },
      }]
      */
    },
    {
      path: '/requests/study/track',
      name: 'trackRequests',
      component: () => import(/* webpackChunkName: "home" */ './views/LayoutTrackRequests.vue'),
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
          next({ name: 'viewData' });
        }
      } else if (to.matched.some(route => routeMetaAuth(route) === false)) {
        // this route requires an unauthenticated user
        if (loggedIn) {
          next({ name: 'viewData' });
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
