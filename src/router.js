import Vue from 'vue';
import Router from 'vue-router';

import store from '@/store';
import { REQUEST_STUDY_REQUIRES_LOCATION } from '@/lib/i18n/Strings';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: { name: 'viewData' },
    },
    {
      path: '/login',
      name: 'login',
      meta: { auth: false },
      component: () => import(/* webpackChunkName: "home" */ './views/FcLogin.vue'),
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
        path: 'location/:centrelineType/:centrelineId',
        name: 'viewDataAtLocation',
        components: {
          filters: () => import(/* webpackChunkName: "home" */ './components/FcFiltersViewDataAtLocation.vue'),
          display: () => import(/* webpackChunkName: "home" */ './components/FcDisplayViewDataAtLocation.vue'),
        },
      }],
    },
    {
      path: '/requests/study/new',
      component: () => import(/* webpackChunkName: "home" */ './views/LayoutRequestStudy.vue'),
      beforeEnter(to, from, next) {
        if (store.state.location === null) {
          store.dispatch('setToast', REQUEST_STUDY_REQUIRES_LOCATION);
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
        components: {
          default: () => import(/* webpackChunkName: "home" */ './views/FcRequestStudySchedule.vue'),
          actionBottom: () => import(/* webpackChunkName: "home" */ './components/FcActionBottomContinueToSpecify.vue'),
        },
      }, {
        path: 'specify',
        name: 'requestStudySpecify',
        components: {
          default: () => import(/* webpackChunkName: "home" */ './views/FcRequestStudySpecify.vue'),
          actionBottom: () => import(/* webpackChunkName: "home" */ './components/FcActionBottomContinueToConfirm.vue'),
        },
      }, {
        path: 'confirm',
        name: 'requestStudyConfirm',
        components: {
          default: () => import(/* webpackChunkName: "home" */ './views/FcRequestStudyConfirm.vue'),
          actionBottom: () => import(/* webpackChunkName: "home" */ './components/FcActionBottomConfirm.vue'),
        },
      }],
    },
    {
      path: '/requests/track',
      name: 'requestsTrack',
      redirect: {
        name: 'requestsTrackByStatus',
      },
    }, {
      path: '/requests/track/byStatus',
      name: 'requestsTrackByStatus',
      component: () => import(/* webpackChunkName: "home" */ './views/FcRequestsTrackByStatus.vue'),
    }, {
      path: '/byId/:id',
      name: 'requestsTrackById',
      component: () => import(/* webpackChunkName: "home" */ './views/FcRequestsTrackById.vue'),
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
          next({ name: 'login' });
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
