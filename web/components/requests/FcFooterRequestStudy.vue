<template>
  <div class="align-center d-flex px-3 py-2">
    <v-spacer></v-spacer>
    <FcButton
      class="mr-2"
      type="tertiary"
      @click="$emit('action-navigate-back')">
      Cancel
    </FcButton>
    <FcButton
      :disabled="v.$invalid"
      type="primary"
      @click="$emit('action-submit')">
      Submit
    </FcButton>
  </div>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcFooterRequestStudy',
  components: {
    FcButton,
  },
  props: {
    studyRequest: Object,
    v: Object,
  },
};
</script>
