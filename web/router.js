import Vue from 'vue';
import Router from 'vue-router';

import {
  ROUTE_NOT_LOGGED_IN,
} from '@/lib/i18n/Strings';
import store from '@/web/store';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    // NON-DRAWER ROUTES
    {
      path: '/requests/track',
      name: 'requestsTrack',
      meta: {
        title({ query: { isSupervisor = null } }) {
          if (isSupervisor) {
            return 'Manage Requests';
          }
          return 'Track Requests';
        },
      },
      component: () => import(/* webpackChunkName: "home" */ '@/web/views/FcRequestsTrack.vue'),
    },
    // DRAWER ROUTES
    {
      path: '/',
      meta: { title: 'View Map' },
      component: () => import(/* webpackChunkName: "home" */ '@/web/views/FcLayoutDrawerMap.vue'),
      children: [{
        path: '',
        name: 'home',
        meta: {
          auth: { mode: 'try' },
        },
        redirect: { name: 'viewData' },
      }, {
        path: '/view',
        name: 'viewData',
        meta: {
          auth: { mode: 'try' },
          title: 'View Map',
        },
        component: null,
        beforeEnter(to, from, next) {
          store.commit('setDrawerOpen', false);
          next();
        },
      }, {
        path: '/auth/adfs-callback',
        name: 'adfsCallback',
        meta: {
          auth: { mode: 'try' },
          title: 'Log In: City of Toronto',
        },
        component: () => import(/* webpackChunkName: "home" */ '@/web/views/FcAdfsCallback.vue'),
      }, {
        path: '/view/location/:centrelineType/:centrelineId',
        name: 'viewDataAtLocation',
        meta: {
          auth: { mode: 'try' },
          title: 'View Data',
        },
        component: () => import(/* webpackChunkName: "home" */ '@/web/components/FcDrawerViewData.vue'),
        beforeEnter(to, from, next) {
          store.commit('setDrawerOpen', true);
          next();
        },
      }, {
        path: '/view/location/:centrelineType/:centrelineId/reports/:studyTypeName',
        name: 'viewReportsAtLocation',
        meta: {
          auth: { mode: 'try' },
          title: 'View Reports',
        },
        component: () => import(/* webpackChunkName: "home" */ '@/web/components/FcDrawerViewReports.vue'),
        beforeEnter(to, from, next) {
          store.commit('setDrawerOpen', false);
          next();
        },
      }, {
        path: '/requests/study/new',
        name: 'requestStudyNew',
        meta: { title: 'New Request' },
        component: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcDrawerRequestStudy.vue'),
        beforeEnter(to, from, next) {
          store.commit('setDrawerOpen', true);
          next();
        },
      }, {
        path: '/requests/study/:id/edit',
        name: 'requestStudyEdit',
        meta: {
          title({ params: { id } }) {
            return `Edit Request #${id}`;
          },
        },
        component: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcDrawerRequestStudy.vue'),
        beforeEnter(to, from, next) {
          store.commit('setDrawerOpen', true);
          next();
        },
      }, {
        path: '/requests/study/:id',
        name: 'requestStudyView',
        meta: {
          title({ params: { id } }) {
            return `View Request #${id}`;
          },
        },
        component: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcDrawerViewRequest.vue'),
        beforeEnter(to, from, next) {
          store.commit('setDrawerOpen', true);
          next();
        },
      }],
    },
    {
      path: '*',
      name: '404',
      meta: { auth: { mode: 'try' } },
      component: () => import(/* webpackChunkName: "home" */ '@/web/views/Fc404.vue'),
    },
  ],
});

/**
 * Returns the value of `meta[key]` from the most specific route matched above
 * that defines such a value.
 *
 * @param {Array<Object>} to - routes matched from `router` above
 * @param {string} key - key to fetch from `meta`
 * @param {*} defaultValue - default value to use if `meta[key]` does not exist
 * @returns {*} value of `meta[key]` from most specific matched route, or
 * `defaultValue` if no such route defines `meta[key]`.
 */
function routeMetaKey(to, key, defaultValue) {
  /*
   * The `hasOwnProperty()` call here is essential: some `meta` keys can take falsy values
   * (e.g. `false`, `0`, etc.), which would fail a simple `route.meta && route.meta[key]`
   * check in `find()`.
   */
  const routeWithKey = to.matched.slice().reverse()
    .find(route => route.meta && Object.prototype.hasOwnProperty.call(route.meta, key));
  if (routeWithKey === undefined) {
    return defaultValue;
  }
  return routeWithKey.meta[key];
}

/**
 * Determines if the user has necessary permissions to view `to`.
 *
 * @param to {Object} - route to check permissions for
 * @returns {Boolean|Object} false if user has necessary permissions (i.e. no redirect needed),
 * otherwise the route to redirect to
 */
async function beforeEachCheckAuth(to) {
  const { loggedIn } = await store.dispatch('checkAuth');
  /*
    * As part of "security by design", our default assumption is that a route
    * requires authentication.  A route must manually override this to specify
    * different behaviour.
    */
  const metaAuth = routeMetaKey(to, 'auth', true);
  if (metaAuth === true) {
    if (!loggedIn) {
      store.dispatch('setToast', ROUTE_NOT_LOGGED_IN);
    }
    return loggedIn;
  }
  if (metaAuth === false) {
    // this route requires an unauthenticated user
    return !loggedIn;
  }
  return true;
}

router.beforeEach(async (to, from, next) => {
  const meetsAuthRequirements = await beforeEachCheckAuth(to);
  if (meetsAuthRequirements) {
    next();
  } else {
    next(false);
  }
});

function afterEachSetTitle(to) {
  let title = routeMetaKey(to, 'title', undefined);
  if (title === undefined) {
    document.title = 'MOVE';
    return;
  }
  if (title instanceof Function) {
    title = title(to);
  }
  title = `MOVE \u00b7 ${title}`;
  document.title = title;
}

router.afterEach((to) => {
  afterEachSetTitle(to);
});

function onErrorShowToast(err) {
  return {
    variant: 'error',
    text: err.message,
  };
}

router.onError((err) => {
  const { currentRoute } = router;
  const toast = onErrorShowToast(err, currentRoute);
  if (toast) {
    store.dispatch('setToast', toast);
  }
});

export default router;
