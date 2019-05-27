import Vue from 'vue';
import Router from 'vue-router';

import store from '@/store';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: { name: 'viewData' },
    },
    {
      path: '/view',
      component: () => import(/* webpackChunkName: "home" */ './views/LayoutViewData.vue'),
      children: [{
        path: '',
        name: 'viewData',
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
        beforeEnter: (to, from, next) => {
          if (store.state.location === null) {
            const { keyString } = to.params;
            store.dispatch('fetchLocation', keyString)
              .then(() => {
                next();
              })
              .catch((err) => {
                next(err);
              });
          } else {
            next();
          }
        },
      }],
    },
    {
      path: '/requests/study/new',
      component: () => import(/* webpackChunkName: "home" */ './views/LayoutRequestStudy.vue'),
      beforeEnter(to, from, next) {
        if (store.state.location === null) {
          // TODO: warn user that this requires location
          next({ name: 'home' });
        } else {
          if (store.state.studyRequest === null) {
            store.commit('setNewStudyRequest', []);
          }
          next();
        }
      },
      children: [{
        path: '',
        name: 'requestStudy',
        components: {
          default: () => import(/* webpackChunkName: "home" */ './views/FcRequestStudyRequest.vue'),
          actionBottom: () => import(/* webpackChunkName: "home" */ './components/FcActionBottomRequestData.vue'),
        },
      }, {
        path: 'schedule',
        name: 'requestStudySchedule',
        component: () => import(/* webpackChunkName: "home" */ './views/FcRequestStudySchedule.vue'),
      }, {
        path: 'confirm',
        name: 'requestStudyConfirm',
        component: () => import(/* webpackChunkName: "home" */ './views/FcRequestStudyConfirm.vue'),
      }],
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
          next({ name: 'home' });
        }
      } else if (to.matched.some(route => routeMetaAuth(route) === false)) {
        // this route requires an unauthenticated user
        if (loggedIn) {
          next({ name: 'home' });
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
