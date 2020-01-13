<template>
  <div class="fc-input-text-array">
    <div
      v-for="(s, i) in internalValue"
      :key="i"
      class="flex-container-row mb-s">
      <input
        v-model="internalValue[i]"
        class="flex-fill font-size-l"
        :name="name"
        type="text" />
      <v-btn
        class="full-width mb-m"
        icon
        @click.prevent="onRemove(i)">
        <v-icon left>mdi-minus</v-icon>
      </v-btn>
    </div>
    <div class="flex-container-row">
      <v-btn
        class="full-width mb-m"
        @click.prevent="onAdd">
        <v-icon left>mdi-plus</v-icon> Add
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FcInputTextArray',
  props: {
    name: String,
    value: Array,
  },
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
  methods: {
    onAdd() {
      this.internalValue.push('');
      /* eslint-disable-next-line no-self-assign */
      this.internalValue = this.internalValue;
    },
    onRemove(i) {
      this.internalValue.splice(i, 1);
      /* eslint-disable-next-line no-self-assign */
      this.internalValue = this.internalValue;
    },
  },
};
</script>

<style lang="postcss">
.fc-input-text-array {
  & > div {
    align-items: center;
  }
}
</style>
