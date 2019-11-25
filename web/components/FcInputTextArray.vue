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
      <button
        class="font-size-l btn-remove"
        type="button"
        @click.prevent="onRemove(i)">
        <i class="fa fa-minus" />
      </button>
    </div>
    <div class="flex-container-row">
      <button
        class="font-size-l full-width mb-m"
        type="button"
        @click.prevent="onAdd">
        <i class="fa fa-plus" />
        <span> Add</span>
      </button>
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
      this.internalValue = this.internalValue;
    },
    onRemove(i) {
      this.internalValue.splice(i, 1);
      this.internalValue = this.internalValue;
    },
  },
};
</script>

<style lang="postcss">
.fc-input-text-array {
  & > div {
    align-items: center;
    & > input {
      border-radius: var(--space-s) 0 0 var(--space-s);
    }
    & > button.btn-remove {
      border-radius: 0 var(--space-s) var(--space-s) 0;
    }
  }
}
</style>
