<template>
  <section class="d-flex flex-column min-height-fill max-height-fill">
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <FcStudyRequestBulkDetails
        v-model="internalValue"
        :is-create="false"
        :v="$v.internalValue" />
    </section>

    <v-divider></v-divider>

    <footer class="flex-grow-0 flex-shrink-0">
      <div class="align-center d-flex px-3 py-2">
        <v-spacer></v-spacer>
        <FcButton
          class="mr-2"
          type="tertiary"
          @click="$emit('action-cancel')">
          Cancel
        </FcButton>
        <FcButton
          :disabled="$v.internalValue.$invalid"
          type="primary"
          @click="$emit('action-save')">
          Save
        </FcButton>
      </div>
    </footer>
  </section>
</template>

<script>
import ValidationsStudyRequestBulk from '@/lib/validation/ValidationsStudyRequestBulk';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcStudyRequestBulkDetails
  from '@/web/components/requests/FcStudyRequestBulkDetails.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcEditStudyRequestBulk',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcButton,
    FcStudyRequestBulkDetails,
  },
  validations: {
    internalValue: ValidationsStudyRequestBulk,
  },
};
</script>
