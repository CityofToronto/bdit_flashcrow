<template>
  <div class="fc-input-text-array">
    <div
      v-for="(s, i) in internalValue"
      :key="i"
      class="d-flex flex-row">
      <v-text-field
        v-model="internalValue[i]"
        :error-messages="errorMessagesEach[i]"
        :label="'Email #' + (i + 1)">
        <v-btn
          v-slot:append-outer
          @click.prevent="onRemove(i)">
          <v-icon left>mdi-minus</v-icon> Remove
        </v-btn>
      </v-text-field>
    </div>
    <v-btn
      block
      class="mt-2"
      @click.prevent="onAdd">
      <v-icon left>mdi-plus</v-icon> Add
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'FcInputTextArray',
  props: {
    v: Object,
    value: Array,
  },
  computed: {
    errorMessagesEach() {
      return this.internalValue.map((_, i) => {
        const errors = [];
        if (!this.v.$each[i].$dirty) {
          return errors;
        }
        if (!this.v.$each[i].required) {
          errors.push('Please enter a value.');
        }
        if (!this.v.$each[i].torontoInternal) {
          errors.push('Please enter a valid @toronto.ca email address.');
        }
        return errors;
      });
    },
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
