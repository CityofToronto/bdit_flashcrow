<template>
  <TdsModal
    class="tds-confirm-dialog"
    :data="data">
    <template v-slot:header>
      <h2>{{data.title}}</h2>
    </template>
    <template v-slot:content>
      <p>{{data.prompt}}</p>
    </template>
    <template v-slot:footer>
      <button
        class="tds-button-primary" @click="onClickOk">
        {{textOk}}
      </button>
      <div class="flex-fill"></div>
      <button @click="onClickCancel">
        {{textCancel}}
      </button>
    </template>
  </TdsModal>
</template>

<script>
import TdsMixinModal from '@/components/tds/TdsMixinModal';

const DEFAULT_TEXT_CANCEL = 'Cancel';
const DEFAULT_TEXT_OK = 'OK';

export default {
  name: 'TdsConfirmDialog',
  mixins: [TdsMixinModal],
  computed: {
    textCancel() {
      return this.data.textCancel || DEFAULT_TEXT_CANCEL;
    },
    textOk() {
      return this.data.textOk || DEFAULT_TEXT_OK;
    },
  },
  methods: {
    onClickCancel() {
      this.clearModal();
      if (this.data.actionCancel) {
        this.data.actionCancel();
      }
    },
    onClickOk() {
      this.clearModal();
      if (this.data.action) {
        this.data.action();
      }
    },
  },
};
</script>

<style lang="postcss">
.tds-confirm-dialog.tds-modal-container {
  .tds-modal-backdrop {
    background-color: var(--dialog-backdrop);
  }
  .tds-modal {
    border: var(--border-default);
    border-radius: var(--space-m);
    & > .tds-modal-close {
      display: none;
    }
  }
}
</style>
