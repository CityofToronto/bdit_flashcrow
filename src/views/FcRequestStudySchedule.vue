<template>
  <div class="fc-request-study-schedule flex-fill flex-container-column">
    <header>
      <h2>Schedule Your Request</h2>
    </header>
    <section class="flex-fill flex-container-row">
      <div class="flex-cross-scroll">
        <FcDetailsStudyRequest />
        <FcDetailsStudy
          v-for="({ item, meta }, i) in studyRequest.items"
          :key="i"
          :index="i" />
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import FcDetailsStudy from '@/components/FcDetailsStudy.vue';
import FcDetailsStudyRequest from '@/components/FcDetailsStudyRequest.vue';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';

export default {
  name: 'FcRequestStudySchedule',
  components: {
    FcDetailsStudy,
    FcDetailsStudyRequest,
  },
  computed: {
    ...mapState(['studyRequest']),
  },
  validations: ValidationsStudyRequest.validations,
};
</script>

<style lang="postcss">
.fc-request-study-schedule {

}
</style>
