<template>
  <TdsModal :data="data">
    <template v-slot:header>
      <h2>Confirmation: Request #{{studyRequestId}}</h2>
    </template>
    <template v-slot:content>
      <p v-if="update">
        Your request has been updated.
      </p>
      <p v-else>
        Thank you for your request!  You will receive a confirmation email
        shortly.
      </p>
      <p>
        You should receive your data by
        <strong>{{estimatedDeliveryDate | date}}</strong>.
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

import TdsMixinModal from '@/web/components/tds/TdsMixinModal';

export default {
  name: 'FcModalRequestStudyConfirmation',
  mixins: [TdsMixinModal],
  computed: {
    estimatedDeliveryDate() {
      return this.data.studyRequest.estimatedDeliveryDate;
    },
    priority() {
      return this.data.studyRequest.priority;
    },
    studyRequestId() {
      return this.data.studyRequest.id;
    },
    update() {
      return this.data.update;
    },
  },
  methods: {
    onClickOk() {
      this.clearModal();
      this.setShowMap(true);
    },
    ...mapMutations([
      'setShowMap',
    ]),
  },
};
</script>
