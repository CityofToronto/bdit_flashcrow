<template>
  <div class="fc-display-view-data-at-location flex-2">
    <div class="flex-container-column">
      <header class="flex-container-row">
        <label class="tds-checkbox">
          <input type="checkbox" />
        </label>
        <div class="flex-fill"></div>
        <button class="tds-button-secondary" :disabled="$v.$invalid">
          <i class="fa fa-download"></i>
        </button>
        <button class="tds-button-secondary" :disabled="$v.$invalid">
          <i class="fa fa-print"></i>
        </button>
        <button
          class="tds-button-primary"
          @click="onClickRequestStudy"
          :disabled="$v.$invalid">
          <i class="fa fa-plus"></i>
          <span> Request Study</span>
        </button>
      </header>
      <FcCardTableCounts :counts="counts" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import FcCardTableCounts from '@/components/FcCardTableCounts.vue';

export default {
  name: 'FcDisplayViewDataAtLocation',
  components: {
    FcCardTableCounts,
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
    onClickRequestStudy() {
      this.$router.push({ name: 'requestStudy' });
      this.setShowMap(true);
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
  max-height: 100%;
  overflow: auto;
  padding: var(--space-m) var(--space-xl);
  & > .flex-container-column > header {
    align-items: center;
    background-color: var(--base-lighter);
    padding: var(--space-m) var(--space-l);
    & > * {
      margin-right: var(--space-m);
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
