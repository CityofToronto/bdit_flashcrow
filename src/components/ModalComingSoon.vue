<template>
  <Modal :data="data">
    <template v-slot:header>
      <h2>Coming Soon!</h2>
    </template>
    <template v-slot:content>
      <p>
        Coming soon: {{data.feature || ''}}!
      </p>
    </template>
    <template v-slot:footer>
      <div class="flex-grow text-right">
        <button class="btn-primary" @click="clearModal">OK</button>
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
    ...mapMutations(['clearModal']),
  },
};
</script>

<style lang="postcss">

</style>
