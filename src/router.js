import Vue from 'vue';
import Router from 'vue-router';

import store from '@/store';
import {
  REQUEST_STUDY_REQUIRES_LOCATION,
  ROUTE_NOT_LOGGED_IN,
} from '@/lib/i18n/Strings';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: { name: 'viewData' },
    },
    {
      path: '/login',
      name: 'login',
      meta: {
        auth: false,
        title: 'Log in',
      },
      component: () => import(/* webpackChunkName: "home" */ './views/FcLogin.vue'),
    },
    {
      path: '/view',
      meta: { title: 'View Map' },
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
        meta: { title: 'View Data' },
        name: 'viewDataAtLocation',
        components: {
          filters: () => import(/* webpackChunkName: "home" */ './components/FcFiltersViewDataAtLocation.vue'),
          display: () => import(/* webpackChunkName: "home" */ './components/FcDisplayViewDataAtLocation.vue'),
        },
      }],
    },
    {
      path: '/requests/study/new',
      meta: { title: 'New Study' },
      component: () => import(/* webpackChunkName: "home" */ './views/LayoutRequestStudy.vue'),
      beforeEnter(to, from, next) {
        const { location, studyRequest } = store.state;
        if (location === null) {
          store.dispatch('setToast', REQUEST_STUDY_REQUIRES_LOCATION);
          next({ name: 'viewData' });
        } else {
          if (
            studyRequest === null
            || studyRequest.centrelineType !== location.centrelineType
            || studyRequest.centrelineId !== location.centrelineId
          ) {
            store.commit('setNewStudyRequest', []);
          }
          next();
        }
      },
      children: [{
        path: '',
        name: 'requestStudy',
        meta: { title: 'New Study: Request' },
        components: {
          default: () => import(/* webpackChunkName: "home" */ './views/FcRequestStudyRequest.vue'),
          actionBottom: () => import(/* webpackChunkName: "home" */ './components/FcActionBottomRequestData.vue'),
        },
      }, {
        path: 'schedule',
        name: 'requestStudySchedule',
        meta: { title: 'New Study: Schedule' },
        components: {
          default: () => import(/* webpackChunkName: "home" */ './views/FcRequestStudySchedule.vue'),
          actionBottom: () => import(/* webpackChunkName: "home" */ './components/FcActionBottomContinueToSpecify.vue'),
        },
      }, {
        path: 'specify',
        name: 'requestStudySpecify',
        meta: { title: 'New Study: Specify' },
        components: {
          default: () => import(/* webpackChunkName: "home" */ './views/FcRequestStudySpecify.vue'),
          actionBottom: () => import(/* webpackChunkName: "home" */ './components/FcActionBottomContinueToConfirm.vue'),
        },
      }, {
        path: 'confirm',
        name: 'requestStudyConfirm',
        meta: { title: 'New Study: Confirm' },
        components: {
          default: () => import(/* webpackChunkName: "home" */ './views/FcRequestStudyConfirm.vue'),
          actionBottom: () => import(/* webpackChunkName: "home" */ './components/FcActionBottomConfirm.vue'),
        },
      }],
    },
    {
      path: '/requests/track',
      name: 'requestsTrack',
      meta: { title: 'Track Requests' },
      component: () => import(/* webpackChunkName: "home" */ './views/FcRequestsTrack.vue'),
    },
    {
      path: '/requests/study/:id',
      name: 'requestStudyView',
      meta: {
        title({ params: { id } }) {
          return `View Request #${id}`;
        },
      },
      component: () => import(/* webpackChunkName: "home" */ './views/FcRequestStudyView.vue'),
    },
    {
      path: '*',
      name: '404',
      meta: { auth: { mode: 'try' } },
      component: () => import(/* webpackChunkName: "home" */ './views/Fc404.vue'),
    },
  ],
});

/**
 * Returns the value of `meta[key]` from the most specific route matched above
 * that defines such a value.
 *
 * @param {Array<Object>} to - routes matched from `router` above
 * @param {String} key - key to fetch from `meta`
 * @param {}
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
 * otherwise the route to redirect to (e.g. for login)
 */
async function beforeEachCheckAuth(to) {
  try {
    const { loggedIn } = await store.dispatch('checkAuth');
    /*
     * As part of "security by design", our default assumption is that a route
     * requires authentication.  A route must manually override this to specify
     * different behaviour.
     */
    const metaAuth = routeMetaKey(to, 'auth', true);
    if (metaAuth === true) {
      // this route requires an authenticated user
      if (loggedIn) {
        return false;
      }
      store.dispatch('setToast', ROUTE_NOT_LOGGED_IN);
      const { path } = to;
      return { name: 'login', query: { path } };
    }
    if (metaAuth === false) {
      // this route requires an unauthenticated user
      return loggedIn ? { name: 'home' } : false;
    }
    return false;
  } catch (err) {
    console.log(err);
    // prevent infinite redirect to login
    return to.name === 'login' ? false : { name: 'login' };
  }
}

router.beforeEach((to, from, next) => {
  beforeEachCheckAuth(to)
    .then((redirect) => {
      if (redirect) {
        next(redirect);
      } else {
        next();
      }
    });
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

export default router;
