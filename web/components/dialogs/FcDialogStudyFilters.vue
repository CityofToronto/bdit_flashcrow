<template>
  <v-dialog
    v-model="internalValue"
    max-width="280">
    <v-card>
      <v-card-title>Filter</v-card-title>
      <v-card-text>
        TODO: filters
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="internalValue = false">Cancel</v-btn>
        <v-btn
          color="primary"
          text
          @click="internalValue = false">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'FcDialogStudyFilters',
  props: {
    value: Boolean,
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
};
</script>
