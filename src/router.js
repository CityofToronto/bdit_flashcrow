import Vue from 'vue';
import Router from 'vue-router';

import store from '@/store';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName: "home" */ './views/Home.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import(/* webpackChunkName: "login" */ './views/Login.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
  ],
});

router.beforeEach((to, from, next) => {
  store.dispatch('checkAuth')
    .then((auth) => {
      if (to.name === 'login') {
        if (auth.loggedIn) {
          next({ name: 'home' });
        } else {
          next();
        }
      } else if (auth.loggedIn) {
        next();
      } else {
        next({ name: 'login' });
      }
    })
    .catch((err) => {
      next(err);
    });
});

export default router;
