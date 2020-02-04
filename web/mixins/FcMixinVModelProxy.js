function getPropsValue(type) {
  if (type === undefined) {
    return ['value'];
  }
  return {
    value: type,
  };
}

export default (type) => {
  const props = getPropsValue(type);
  return {
    props,
    computed: {
      internalValue: {
        get() {
          return this.value;
        },
        set(value) {
          this.$emit('input', value);
        },
      },
    },
  };
};
