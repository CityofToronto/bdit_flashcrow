<template>
  <PaneDisplay class="fc-display-view-data-at-location">
    <template v-slot:content>
      <CountsTable :counts="counts" />
      <div class="validation-error" v-if="!$v.dataSelectionEmpty.notEmpty">
        To request data, first select one or more count types to request.
      </div>
    </template>
    <template v-slot:actionBar>
      <div
        class="selected-count-wrapper text-center"
        :class="{'some-selected': !dataSelectionEmpty}">
        <div class="selected-count">{{dataSelectionLength}}</div>
        <h3>Selected</h3>
      </div>
      <div class="print-wrapper">
        <button
          :disabled="dataSelectionEmpty"
          @click="onClickPrint">
          <i class="fa fa-print"></i> Print All
        </button>
      </div>
      <div class="download-wrapper">
        <button
          :disabled="dataSelectionEmpty"
          @click="onClickDownload">
          <i class="fa fa-print"></i> Download All
        </button>
      </div>
      <div class="start-request-wrapper text-right">
        <button
          class="btn-primary"
          @click="onClickStartRequest">
          Start Request
        </button>
      </div>
    </template>
  </PaneDisplay>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import CountsTable from '@/components/CountsTable.vue';
import PaneDisplay from '@/components/PaneDisplay.vue';

export default {
  name: 'FcDisplayViewDataAtLocation',
  components: {
    CountsTable,
    PaneDisplay,
  },
  computed: {
    ...mapGetters(['dataSelectionEmpty', 'dataSelectionLength']),
    ...mapState(['counts', 'showMap']),
  },
  validations: {
    dataSelectionEmpty: {
      notEmpty: value => !value,
    },
  },
  methods: {
    onClickDownload() {
      this.setModal({
        component: 'ModalComingSoon',
        data: {
          feature: 'download',
        },
      });
    },
    onClickStartRequest() {
      if (this.$v.$invalid) {
        /* eslint-disable no-alert */
        window.alert('The form contains one or more errors.');
      } else {
        this.$router.push({ name: 'requestsNewRequest' });
        this.setShowMap(false);
      }
    },
    onClickPrint() {
      this.setModal({
        component: 'ModalComingSoon',
        data: {
          feature: 'print',
        },
      });
    },
    ...mapMutations(['setModal', 'setShowMap']),
  },
};
</script>

<style lang="postcss">
.fc-display-view-data-at-location {
  footer {
    & > .selected-count-wrapper,
    & > .print-wrapper,
    & > .download-wrapper {
      flex: 1;
      & > button {
        height: 100%;
      }
    }
    & > .start-request-wrapper {
      flex: 3;
      & > button {
        height: 100%;
      }
    }
    & > .selected-count-wrapper {
      color: var(--base-darkest);
      & > .selected-count {
        background-color: var(--base-lightest);
        border: 1px solid var(--base-darkest);
        border-radius: 16px;
        font-size: var(--font-size-2xl);
        height: 32px;
        line-height: 30px;
        margin: auto;
        width: 32px;
      }
      &.some-selected {
        color: var(--success-darker);
        & > .selected-count {
          background-color: var(--success-light);
          border-color: var(--success-darker);
        }
      }
    }
  }
}
</style>
