<template>
  <FcDialogAlert
    v-model="show"
    title="MVCR Not Found">
    <p class="body-1">
      The MVCR (Motor Vehicle Collision Report) you've request could not be found.
      The MOVE team has been notified of the error.
    </p>
  </FcDialogAlert>
</template>

<script>
import FcDialogAlert from '@/web/components/dialogs/FcDialogAlert.vue';

export default {
  name: 'MvcrNotFoundAlert',
  components: {
    FcDialogAlert,
  },
  props: {
    showDialog: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    show: {
      get() {
        return this.showDialog;
      },
      set() {
        this.closeDialog();
      },
    },
  },
  methods: {
    closeDialog() {
      this.$emit('close');
      return true;
    },
  },
};
</script>
