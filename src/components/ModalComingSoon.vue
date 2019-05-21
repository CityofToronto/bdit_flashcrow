<template>
  <TdsModal :data="data">
    <template v-slot:header>
      <h2>Coming Soon!</h2>
    </template>
    <template v-slot:content>
      <p>
        Coming soon: {{data.feature || ''}}!
      </p>
    </template>
    <template v-slot:footer>
      <div class="flex-fill text-right">
        <button class="btn-primary" @click="clearModal">OK</button>
      </div>
    </template>
  </TdsModal>
</template>

<script>
import { mapMutations } from 'vuex';

import TdsModal from '@/components/tds/TdsModal.vue';

export default {
  name: 'ModalComingSoon',
  components: {
    TdsModal,
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
