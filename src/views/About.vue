<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div>
      <span id="info_counter">Counter: {{counter}}</span>
      <button id="btn_increment" @click="incrementCounter" :disabled="loading">Increment</button>
      <button id="btn_reset" @click="resetCounter" :disabled="loading">Reset</button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'About',
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
