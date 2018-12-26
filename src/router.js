import Vue from 'vue';
import Router from 'vue-router';

import apiFetch from '@/lib/ApiFetch';

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
  apiFetch('/auth')
    .then((response) => {
      if (to.name === 'login') {
        if (response.loggedIn) {
          next({ name: 'home' });
        } else {
          next();
        }
      } else if (response.loggedIn) {
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
