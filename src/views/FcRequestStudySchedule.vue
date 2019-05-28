<template>
  <div class="fc-request-study-schedule flex-fill">
    <h2>Schedule Your Request</h2>
    <div class="form-group">
      <strong>Do you have a service request number?</strong>
      <TdsButtonGroup
        v-model="hasServiceRequestId"
        name="hasServiceRequestId"
        :options="[
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ]"
        type="radio" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import TdsButtonGroup from '@/components/tds/TdsButtonGroup.vue';
import validations from '@/lib/validation/ValidationsStudyRequest';

export default {
  name: 'FcRequestStudySchedule',
  components: {
    TdsButtonGroup,
  },
  data() {
    return {
      hasServiceRequestId: null,
    };
  },
  computed: {
    ...mapState(['studyRequest']),
  },
  validations,
};
</script>

<style lang="postcss">
.fc-request-study-schedule {

}
</style>
