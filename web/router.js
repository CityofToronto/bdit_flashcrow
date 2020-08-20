import Vue from 'vue';
import Router from 'vue-router';

import { AuthScope } from '@/lib/Constants';
import { hasAuthScope } from '@/lib/auth/ScopeMatcher';
import analyticsClient from '@/web/analytics/analyticsClient';
import store from '@/web/store';
import { restoreLoginState, saveLoginState } from '@/web/store/LoginState';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    // NON-DRAWER ROUTES
    {
      path: '/admin',
      meta: {
        auth: {
          scope: [AuthScope.ADMIN],
        },
        title: 'Admin Console',
      },
      component: () => import(/* webpackChunkName: "admin" */ '@/web/views/FcAdmin.vue'),
      children: [{
        path: '',
        name: 'admin',
        redirect: { name: 'adminPermissions' },
      }, {
        path: '/admin/metrics',
        name: 'adminMetrics',
        meta: {
          title: 'Admin Console: Metrics',
        },
        component: () => import(/* webpackChunkName: "admin" */ '@/web/components/admin/FcAdminMetrics.vue'),
      }, {
        path: '/admin/permissions',
        name: 'adminPermissions',
        meta: {
          title: 'Admin Console: Permissions',
        },
        component: () => import(/* webpackChunkName: "admin" */ '@/web/components/admin/FcAdminPermissions.vue'),
      }],
    },
    {
      path: '/requests/track',
      name: 'requestsTrack',
      meta: {
        auth: {
          scope: [AuthScope.STUDY_REQUESTS],
        },
        title: 'Track Requests',
      },
      component: () => import(/* webpackChunkName: "home" */ '@/web/views/FcRequestsTrack.vue'),
      beforeEnter(to, from, next) {
        store.commit('setBackViewRequest', to);
        next();
      },
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
        path: '/view/location/:s1/:selectionTypeName',
        name: 'viewDataAtLocation',
        meta: {
          auth: { mode: 'try' },
          title: 'View Data',
        },
        component: () => import(/* webpackChunkName: "home" */ '@/web/components/FcDrawerViewData.vue'),
        beforeEnter(to, from, next) {
          store.commit('setBackViewRequest', to);
          store.commit('setDrawerOpen', true);
          next();
        },
      }, {
        path: '/view/location/:s1/:selectionTypeName/reports/collision',
        name: 'viewCollisionReportsAtLocation',
        meta: {
          auth: { mode: 'try' },
          title: 'View Collision Reports',
          vertical: true,
        },
        component: () => import(/* webpackChunkName: "home" */ '@/web/components/FcDrawerViewCollisionReports.vue'),
        beforeEnter(to, from, next) {
          store.commit('setDrawerOpen', false);
          next();
        },
      }, {
        path: '/view/location/:s1/:selectionTypeName/reports/:studyTypeName',
        name: 'viewStudyReportsAtLocation',
        meta: {
          auth: { mode: 'try' },
          title: 'View Study Reports',
          vertical: true,
        },
        component: () => import(/* webpackChunkName: "home" */ '@/web/components/FcDrawerViewStudyReports.vue'),
        beforeEnter(to, from, next) {
          store.commit('setDrawerOpen', false);
          next();
        },
      }, {
        path: '/requests/study/new',
        name: 'requestStudyNew',
        meta: {
          auth: {
            scope: [AuthScope.STUDY_REQUESTS_EDIT],
          },
          title: 'New Request',
        },
        component: () => import(/* webpackChunkName: "requestStudy" */ '@/web/components/FcDrawerRequestStudy.vue'),
        beforeEnter(to, from, next) {
          store.commit('setDrawerOpen', true);
          next();
        },
      }, {
        path: '/requests/study/:id/edit',
        name: 'requestStudyEdit',
        meta: {
          auth: {
            scope: [AuthScope.STUDY_REQUESTS_EDIT],
          },
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
          auth: {
            scope: [AuthScope.STUDY_REQUESTS],
          },
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
 * As part of "security by design", our default assumption is that a route requires
 * authentication, and that no specific scopes are required.  A route must manually
 * override this to specify different behaviour.
 *
 * @param {Array<Object>} to - routes matched from `router` above
 * @returns {Object} value of `meta.auth` from most specific matched route, filled
 * in with default values for any missing auth configuration fields
 */
function routeMetaAuth(to) {
  const metaAuth = routeMetaKey(to, 'auth', {});
  return {
    mode: 'required',
    scope: [],
    ...metaAuth,
  };
}

router.beforeEach(async (to, from, next) => {
  /*
   * Handle login redirects using `window.sessionStorage`.
   */
  if (restoreLoginState(next)) {
    return;
  }

  const { loggedIn, user } = await store.dispatch('checkAuth');
  const { mode, scope } = routeMetaAuth(to, 'auth', {});
  if (mode === 'required') {
    // This route requires authenticated users.
    if (loggedIn) {
      if (hasAuthScope(user, scope)) {
        next();
      } else {
        next(false);
        store.commit('setDialog', {
          dialog: 'ConfirmUnauthorized',
          dialogData: { scope },
        });
      }
    } else {
      next(false);

      const event = analyticsClient.signInEvent();
      await analyticsClient.send([event]);

      saveLoginState(to);
      document.forms.formSignIn.submit();
    }
  } else if (mode === 'optional') {
    // This route requires unauthenticated users.
    if (loggedIn) {
      next(false);
    } else {
      next();
    }
  } else {
    // This route accepts both unauthenticated and authenticated users.
    next();
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

function afterEachAppRouteEvent() {
  const event = analyticsClient.appRouteEvent();
  analyticsClient.send([event]);
}

router.afterEach((to) => {
  afterEachSetTitle(to);

  /*
   * To accurately log the page title, this must be called after `afterEachSetTitle()`.
   * Otherwise, the analytics event will contain the old page title from before the
   * `vue-router` transition.
   *
   * Since the event is recorded in `afterEach`, an error here (e.g. if the analytics
   * service is unreachable) cannot abort the route transition.  That's a good thing!
   * In the event of an analytics outage, or of a bug in `analyticsClient`, ideally
   * only analytics tracking should be affected - the rest of MOVE should continue to
   * function as normal.
   */
  afterEachAppRouteEvent();
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
    store.commit('setToast', toast);
  }
});

export default router;
