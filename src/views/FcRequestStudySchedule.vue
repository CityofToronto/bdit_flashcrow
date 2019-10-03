<template>
  <div class="fc-request-study-schedule flex-fill flex-container-column">
    <header>
      <h2>Schedule Your Request</h2>
    </header>
    <section class="flex-fill flex-container-row">
      <div class="flex-cross-scroll">
        <FcDetailsStudyRequest
          :v="$v.studyRequest" />
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import FcDetailsStudyRequest from '@/src/components/FcDetailsStudyRequest.vue';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';

export default {
  name: 'FcRequestStudySchedule',
  components: {
    FcDetailsStudyRequest,
  },
  computed: {
    ...mapState(['studyRequest']),
  },
  validations: ValidationsStudyRequest.validationsMeta,
};
</script>
