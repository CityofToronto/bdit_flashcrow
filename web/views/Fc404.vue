<template>
  <div class="fc-404">
    <h2>HTTP 404 Not Found</h2>
    <p>
      Click
      <router-link :to="{ name: 'home' }">
        here
      </router-link>
      to return home, or use the sidebar links to return
      to other parts of MOVE.
    </p>
  </div>
</template>

<script>
export default {
  name: 'Fc404',
};
</script>
