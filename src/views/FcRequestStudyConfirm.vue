<template>
  <div class="fc-request-study-confirm flex-fill flex-container-column">
    <header>
      <h2>Confirm Your Request</h2>
    </header>
    <section class="flex-fill flex-container-row">
      <div class="flex-cross-scroll">
        <FcSummaryStudyRequest />
        <FcSummaryStudy
          v-for="(_, i) in studyRequest.studies"
          :key="i"
          :index="i" />
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import FcSummaryStudy from '@/components/FcSummaryStudy.vue';
import FcSummaryStudyRequest from '@/components/FcSummaryStudyRequest.vue';

export default {
  name: 'FcRequestStudyConfirm',
  components: {
    FcSummaryStudy,
    FcSummaryStudyRequest,
  },
  computed: {
    ...mapState(['studyRequest']),
  },
};
</script>

<style lang="postcss">
.fc-request-study-confirm {

}
</style>
