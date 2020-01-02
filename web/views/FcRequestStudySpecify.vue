<template>
  <div class="fc-request-study-specify flex-fill flex-container-column">
    <header>
      <h2>Specify Your Study Details</h2>
    </header>
    <section class="flex-fill flex-container-row">
      <div class="flex-cross-scroll">
        <FcDetailsStudy
          v-for="(_, i) in studyRequest.studies"
          :key="i"
          :index="i"
          :v="$v.studyRequest.studies.$each[i]" />
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import FcDetailsStudy from '@/web/components/FcDetailsStudy.vue';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';

export default {
  name: 'FcRequestStudySpecify',
  components: {
    FcDetailsStudy,
  },
  computed: {
    ...mapState('requestStudy', ['studyRequest']),
  },
  validations: ValidationsStudyRequest.validations,
};
</script>
