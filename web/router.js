import Vue from 'vue';
import Router from 'vue-router';

import store from '@/web/store';
import {
  REQUEST_STUDY_REQUIRES_LOCATION,
  ROUTE_NOT_LOGGED_IN,
} from '@/lib/i18n/Strings';

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
        meta: {
          auth: { mode: 'try' },
        },
        name: 'home',
        redirect: { name: 'viewData' },
      }, {
        path: '/view',
        meta: {
          auth: { mode: 'try' },
          title: 'View Map',
        },
        name: 'viewData',
        component: null,
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
        meta: {
          auth: { mode: 'try' },
          title: 'View Data',
        },
        name: 'viewDataAtLocation',
        component: () => import(/* webpackChunkName: "home" */ '@/web/components/FcDisplayViewDataAtLocation.vue'),
      }, {
        path: '/requests/study/new',
        meta: { title: 'New Request' },
        component: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcDisplayRequestStudy.vue'),
        beforeEnter(to, from, next) {
          const { location, requestStudy: { studyRequest } } = store.state;
          if (location === null) {
            store.dispatch('setToast', REQUEST_STUDY_REQUIRES_LOCATION);
            next({ name: 'viewData' });
          } else {
            if (
              studyRequest === null
              || studyRequest.id !== undefined
              || studyRequest.centrelineType !== location.centrelineType
              || studyRequest.centrelineId !== location.centrelineId
            ) {
              store.commit('requestStudy/setNewStudyRequest', []);
            }
            next();
          }
        },
        children: [{
          path: '',
          name: 'requestStudy',
          meta: { title: 'New Study: Request' },
          components: {
            default: () => import(/* webpackChunkName: "requestStudy" */ '@/web/views/FcRequestStudyRequest.vue'),
            actionBottom: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcActionBottomRequestData.vue'),
          },
        }, {
          path: 'schedule',
          name: 'requestStudySchedule',
          meta: { title: 'New Study: Schedule' },
          components: {
            default: () => import(/* webpackChunkName: "requestStudy" */ '@/web/views/FcRequestStudySchedule.vue'),
            actionBottom: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcActionBottomContinueToSpecify.vue'),
          },
        }, {
          path: 'specify',
          name: 'requestStudySpecify',
          meta: { title: 'New Study: Specify' },
          components: {
            default: () => import(/* webpackChunkName: "requestStudy" */ '@/web/views/FcRequestStudySpecify.vue'),
            actionBottom: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcActionBottomContinueToConfirm.vue'),
          },
        }, {
          path: 'confirm',
          name: 'requestStudyConfirm',
          meta: { title: 'New Study: Confirm' },
          components: {
            default: () => import(/* webpackChunkName: "requestStudy" */ '@/web/views/FcRequestStudyConfirm.vue'),
            actionBottom: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcActionBottomConfirm.vue'),
          },
        }],
      }, {
        path: '/requests/study/:id/edit',
        meta: {
          title({ params: { id } }) {
            return `Edit Request #${id}`;
          },
        },
        component: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcDisplayRequestStudy.vue'),
        children: [{
          path: '',
          name: 'requestStudyEdit',
          meta: {
            title({ params: { id } }) {
              return `Edit Request #${id}: Request`;
            },
          },
          components: {
            default: () => import(/* webpackChunkName: "requestStudy" */ '@/web/views/FcRequestStudyRequest.vue'),
            actionBottom: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcActionBottomRequestData.vue'),
          },
        }, {
          path: 'schedule',
          name: 'requestStudyEditSchedule',
          meta: {
            title({ params: { id } }) {
              return `Edit Request #${id}: Schedule`;
            },
          },
          components: {
            default: () => import(/* webpackChunkName: "requestStudy" */ '@/web/views/FcRequestStudySchedule.vue'),
            actionBottom: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcActionBottomContinueToSpecify.vue'),
          },
        }, {
          path: 'specify',
          name: 'requestStudyEditSpecify',
          meta: {
            title({ params: { id } }) {
              return `Edit Request #${id}: Specify`;
            },
          },
          components: {
            default: () => import(/* webpackChunkName: "requestStudy" */ '@/web/views/FcRequestStudySpecify.vue'),
            actionBottom: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcActionBottomContinueToConfirm.vue'),
          },
        }, {
          path: 'confirm',
          name: 'requestStudyEditConfirm',
          meta: {
            title({ params: { id } }) {
              return `Edit Request #${id}: Confirm`;
            },
          },
          components: {
            default: () => import(/* webpackChunkName: "requestStudy" */ '@/web/views/FcRequestStudyConfirm.vue'),
            actionBottom: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcActionBottomConfirm.vue'),
          },
        }],
      }, {
        path: '/requests/study/:id',
        name: 'requestStudyView',
        meta: {
          title({ params: { id } }) {
            return `View Request #${id}`;
          },
        },
        component: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcDisplayRequestStudyView.vue'),
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
  const { path } = to;
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
      return { name: 'home', query: { path, login: true } };
    }
    if (metaAuth === false) {
      // this route requires an unauthenticated user
      return loggedIn ? { name: 'home' } : false;
    }
    return false;
  } catch (err) {
    // prevent infinite redirect to login
    return { name: 'home' };
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
