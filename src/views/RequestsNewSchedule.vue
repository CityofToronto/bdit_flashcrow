<template>
<LayoutMain
  class="requests-new-schedule">
    <template v-slot:navSecondary>
      <router-link
        class="link-back"
        :to="linkBackTo">
        View all data
      </router-link>
      <BreadcrumbRequestsNew />
      <ToggleShowMap />
    </template>
    <template v-slot:panes>
      <PaneDisplay>
        <template v-slot:content>
          <h2>Your Count Details</h2>
          <CountDetails
            v-for="(_, i) in dataSelection.items"
            :key="i"
            :index="i"
            :v="$v.dataSelectionItemsMeta.$each[i]" />
          <NewRequestDetails
            :v="$v.dataSelectionMeta" />
        </template>
        <template v-slot:actionBar>
          <button
            class="btn-continue btn-primary"
            @click="onClickContinue">
            Continue
          </button>
        </template>
      </PaneDisplay>
      <PaneMap v-if="showMap" />
    </template>
  </LayoutMain>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { mapGetters, mapState } from 'vuex';

import BreadcrumbRequestsNew from '@/components/BreadcrumbRequestsNew.vue';
import CountDetails from '@/components/CountDetails.vue';
import LayoutMain from '@/components/LayoutMain.vue';
import NewRequestDetails from '@/components/NewRequestDetails.vue';
import PaneDisplay from '@/components/PaneDisplay.vue';
import PaneMap from '@/components/PaneMap.vue';
import ToggleShowMap from '@/components/ToggleShowMap.vue';

export default {
  name: 'RequestsNewSchedule',
  components: {
    BreadcrumbRequestsNew,
    CountDetails,
    LayoutMain,
    NewRequestDetails,
    PaneDisplay,
    PaneMap,
    ToggleShowMap,
  },
  computed: {
    linkBackTo() {
      const query = this.location === null ? '' : this.location.geoId;
      return { name: 'viewQuery', params: { query } };
    },
    ...mapGetters(['dataSelectionItemsMeta', 'dataSelectionMeta']),
    ...mapState(['dataSelection', 'location', 'showMap']),
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
.requests-new-schedule {
  & .breadcrumb-steps {
    flex: 1;
    margin: 0 calc(var(--sp) * 8);
  }
  & .pane-display {
    flex: 2;
  }
  & .pane-map {
    flex: 1;
  }
  footer {
    & > .btn-continue {
      height: 40px;
      width: 100%;
    }
  }
}
</style>
