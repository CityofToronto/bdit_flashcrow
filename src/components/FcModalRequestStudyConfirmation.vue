<template>
  <TdsModal :data="data">
    <template v-slot:header>
      <h2>Confirmation: Request #1234567890</h2>
    </template>
    <template v-slot:content>
      <p>Thank you for your request!</p>
      <p>
        You should receive your data by
        <strong>{{dueDate | date}}</strong>.
      </p>
      <p v-if="priority === 'URGENT'">
        You've marked this request urgent.  The Traffic Safety Unit will
        contact you to make adjustments to the schedule.
      </p>
      <p v-else>
        The Traffic Safety Unit will contact you if there are unforeseen
        scheduling changes.
      </p>
    </template>
    <template v-slot:footer>
      <div class="flex-fill text-right">
        <button class="tds-button-primary" @click="onClickOk">OK</button>
      </div>
    </template>
  </TdsModal>
</template>

<script>
import { mapMutations } from 'vuex';

import TdsMixinModal from '@/components/tds/TdsMixinModal';

export default {
  name: 'FcModalRequestStudyConfirmation',
  mixins: [TdsMixinModal],
  computed: {
    dueDate() {
      return this.data.meta.dueDate;
    },
    priority() {
      return this.data.meta.priority;
    },
  },
  methods: {
    onClickOk() {
      this.clearModal();
      // TODO: clear location, query as well
      this.setShowMap(true);
    },
    ...mapMutations([
      'setShowMap',
    ]),
  },
};
</script>

<style lang="postcss">

</style>
