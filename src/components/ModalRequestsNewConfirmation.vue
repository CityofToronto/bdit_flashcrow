<template>
  <Modal :data="data">
    <template v-slot:header>
      <h2>Confirmation: Request #1234567890</h2>
    </template>
    <template v-slot:content>
      <p>Thank you for your request!</p>
      <p v-if="data.priority === 'URGENT'">
        You've marked this request urgent.  The Traffic Safety Unit will
        contact you to make adjustments to the schedule.
      </p>
      <p v-else>
        You should receive your data by
        <strong>{{data.estimatedDeliveryDate | date}}</strong>.
        The Traffic Safety Unit will contact you if there are unforeseen
        scheduling changes.
      </p>
    </template>
    <template v-slot:footer>
      <div class="flex-grow text-right">
        <button class="btn-primary" @click="onClickOk">OK</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import { mapMutations } from 'vuex';

import Modal from '@/components/Modal.vue';

export default {
  name: 'ModalComingSoon',
  components: {
    Modal,
  },
  props: {
    data: {
      type: Object,
      default() { return {}; },
    },
  },
  methods: {
    onClickOk() {
      this.clearModal();
      this.clearDataSelection();
      // TODO: clear location, query as well
      this.setShowMap(true);
    },
    ...mapMutations([
      'clearDataSelection',
      'clearModal',
      'setShowMap',
    ]),
  },
};
</script>

<style lang="postcss">

</style>
