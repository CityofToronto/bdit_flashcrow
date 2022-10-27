export default {
  methods: {
    sleep(duration) {
      return new Promise(resolve => setTimeout(resolve, duration));
    },
  },
};
