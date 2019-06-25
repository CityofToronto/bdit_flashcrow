<template>
  <div class="fc-request-study-schedule flex-fill flex-container-column">
    <header>
      <h2>Specify Your Study Details</h2>
    </header>
    <section class="flex-fill flex-container-row">
      <div class="flex-cross-scroll">
        <FcDetailsStudy
          v-for="({ item, meta }, i) in studyRequest.items"
          :key="i"
          :index="i"
          :v="$v.studyRequest.items.$each[i].meta" />
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import FcDetailsStudy from '@/components/FcDetailsStudy.vue';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';

export default {
  name: 'FcRequestStudySpecify',
  components: {
    FcDetailsStudy,
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
