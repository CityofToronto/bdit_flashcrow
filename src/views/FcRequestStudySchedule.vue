<template>
  <div class="fc-request-study-schedule flex-fill">
    <h2>Your Count Details</h2>
    <CountDetails
      v-for="(_, i) in dataSelection.items"
      :key="i"
      :index="i"
      :v="$v.dataSelectionItemsMeta.$each[i]" />
    <NewRequestDetails
      :v="$v.dataSelectionMeta" />
    <button
      class="btn-continue tds-button-primary"
      @click="onClickContinue">
      Continue
    </button>
  </div>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { mapGetters, mapState } from 'vuex';

import CountDetails from '@/components/CountDetails.vue';
import NewRequestDetails from '@/components/NewRequestDetails.vue';

export default {
  name: 'RequestsNewSchedule',
  components: {
    CountDetails,
    NewRequestDetails,
  },
  computed: {
    ...mapGetters(['dataSelectionItemsMeta', 'dataSelectionMeta']),
    ...mapState(['dataSelection']),
  },
  validations: {
    dataSelectionItemsMeta: {
      $each: {
        daysOfWeek: {
          required,
        },
        notes: {
          requiredIfOtherHours: requiredIf(meta => meta.hours === 'OTHER'),
        },
      },
    },
    dataSelectionMeta: {
      reason: {
        required,
      },
    },
  },
  methods: {
    onClickContinue() {
      if (this.$v.$invalid) {
        /* eslint-disable no-alert */
        window.alert('The form contains one or more errors.');
      } else {
        this.$router.push({ name: 'requestsNewConfirm' });
      }
    },
  },
};
</script>

<style lang="postcss">
.fc-request-study-schedule {
  & > .btn-continue {
    height: 40px;
    width: 100%;
  }
}
</style>
