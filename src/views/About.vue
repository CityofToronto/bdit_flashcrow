<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div>
      <span>Counter: {{counter}}</span>
      <button @click="incrementCounter" :disabled="loading">Increment</button>
      <button @click="resetCounter" :disabled="loading">Reset</button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'about',
  computed: {
    ...mapState(['counter', 'loading']),
  },
  methods: {
    ...mapActions([
      'incrementCounter',
      'init',
      'resetCounter',
    ]),
  },
  mounted() {
    this.init();
  },
};
</script>
