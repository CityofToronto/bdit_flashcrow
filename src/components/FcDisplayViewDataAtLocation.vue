<template>
  <div class="fc-display-view-data-at-location flex-2 flex-container-column">
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
    <CountsTable :counts="counts" />
    <div class="validation-error" v-if="!$v.dataSelectionEmpty.notEmpty">
      To request data, first select one or more count types to request.
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import CountsTable from '@/components/CountsTable.vue';

export default {
  name: 'FcDisplayViewDataAtLocation',
  components: {
    CountsTable,
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
  padding: var(--space-m) var(--space-xl);
  header {
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
