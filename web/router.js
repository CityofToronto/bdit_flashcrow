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
    // HOME ROUTE
    {
      path: '/',
      name: 'home',
      meta: {
        auth: { mode: 'try' },
      },
      redirect: { name: 'viewData' },
    },
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
          title: 'Admin Console',
        },
        component: () => import(/* webpackChunkName: "admin" */ '@/web/components/admin/FcAdminMetrics.vue'),
      }, {
        path: '/admin/permissions',
        name: 'adminPermissions',
        meta: {
          title: 'Admin Console',
        },
        component: () => import(/* webpackChunkName: "admin" */ '@/web/components/admin/FcAdminPermissions.vue'),
      }, {
        path: '/admin/utilities',
        name: 'adminUtilities',
        meta: {
          title: 'Admin Console',
        },
        component: () => import(/* webpackChunkName: "admin" */ '@/web/components/admin/FcAdminUtilities.vue'),
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
      component: () => import(/* webpackChunkName: "trackRequests" */ '@/web/views/FcRequestsTrack.vue'),
      beforeEnter(to, from, next) {
        store.commit('setBackViewRequest', to);
        next();
      },
    },
    {
      path: '/requests/study/:id',
      name: 'requestStudyView',
      meta: {
        auth: {
          scope: [AuthScope.STUDY_REQUESTS],
        },
        title: 'View Request',
      },
      component: () => import(/* webpackChunkName: "trackRequests" */ '@/web/views/FcRequestStudyView.vue'),
    },
    {
      path: '/requests/study/bulk/:id',
      name: 'requestStudyBulkView',
      meta: {
        auth: {
          scope: [AuthScope.STUDY_REQUESTS],
        },
        title: 'View Project',
      },
      component: () => import(/* webpackChunkName: "trackRequests" */ '@/web/views/FcRequestStudyBulkView.vue'),
    },
    {
      path: '/downloads/manage',
      name: 'downloadsManage',
      meta: {
        title: 'Manage Exports',
      },
      component: () => import(/* webpackChunkName: "home" */ '@/web/views/FcDownloadsManage.vue'),
    },
    // VIEW DATA ROUTES
    {
      path: '/view',
      meta: { title: 'View Map' },
      component: () => import(/* webpackChunkName: "home" */ '@/web/views/FcLayoutViewData.vue'),
      children: [{
        path: '',
        name: 'viewData',
        meta: {
          auth: { mode: 'try' },
          filtersReadonly: false,
          showLocationSelection: true,
          title: 'View Map',
          vertical: false,
        },
        component: null,
        beforeEnter(to, from, next) {
          store.commit('viewData/setDrawerOpen', false);
          next();
        },
      }, {
        path: 'location/:s1/:selectionTypeName',
        name: 'viewDataAtLocation',
        meta: {
          auth: { mode: 'try' },
          filtersReadonly: false,
          showLocationSelection: true,
          title: 'View Data',
          vertical: false,
        },
        component: () => import(/* webpackChunkName: "home" */ '@/web/components/FcDrawerViewData.vue'),
        beforeEnter(to, from, next) {
          store.commit('setBackViewRequest', to);
          store.commit('viewData/setDrawerOpen', true);
          next();
        },
      }, {
        path: 'location/:s1/:selectionTypeName/reports/collision',
        name: 'viewCollisionReportsAtLocation',
        meta: {
          auth: { mode: 'try' },
          filtersReadonly: true,
          showLocationSelection: false,
          title: 'View Collision Reports',
          vertical: true,
        },
        component: () => import(/* webpackChunkName: "home" */ '@/web/components/FcDrawerViewCollisionReports.vue'),
        beforeEnter(to, from, next) {
          store.commit('viewData/setDrawerOpen', true);
          next();
        },
      }, {
        path: 'location/:s1/:selectionTypeName/reports/:studyTypeName',
        name: 'viewStudyReportsAtLocation',
        meta: {
          auth: { mode: 'try' },
          filtersReadonly: true,
          showLocationSelection: false,
          title: 'View Study Reports',
          vertical: true,
        },
        component: () => import(/* webpackChunkName: "home" */ '@/web/components/FcDrawerViewStudyReports.vue'),
        beforeEnter(to, from, next) {
          store.commit('viewData/setDrawerOpen', true);
          next();
        },
      }],
    },
    // REQUEST MANAGEMENT EDITOR ROUTES
    {
      path: '/requests',
      meta: { title: 'View Map' },
      component: () => import(/* webpackChunkName: "home" */ '@/web/views/FcLayoutRequestEditor.vue'),
      children: [{
        path: 'study/new/:s1/:selectionTypeName',
        name: 'requestStudyNew',
        meta: {
          auth: {
            scope: [AuthScope.STUDY_REQUESTS],
          },
          title: 'New Request',
        },
        component: () => import(/* webpackChunkName: "trackRequests" */ '@/web/components/FcDrawerRequestStudyNew.vue'),
      }, {
        path: 'study/:id/edit',
        name: 'requestStudyEdit',
        meta: {
          auth: {
            scope: [AuthScope.STUDY_REQUESTS],
          },
          title: 'Edit Request',
        },
        component: () => import(/* webpackChunkName: "trackRequests" */ '@/web/components/FcDrawerRequestStudyEdit.vue'),
      }, {
        path: 'study/bulk/:id/edit',
        name: 'requestStudyBulkEdit',
        meta: {
          auth: {
            scope: [AuthScope.STUDY_REQUESTS],
          },
          title: 'Edit Project',
        },
        component: () => import(/* webpackChunkName: "trackRequests" */ '@/web/components/FcDrawerRequestStudyBulkEdit.vue'),
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
    title = '';
  } else if (title instanceof Function) {
    title = title(to);
  }
  store.commit('setTitle', title);
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
    color: 'error',
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
