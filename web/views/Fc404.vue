<template>
  <div class="fc-404 px-l">
    <h1>Page Not Found</h1>
    <p class="font-size-l">
      Click
      <router-link :to="{ name: 'home' }">here</router-link>
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
