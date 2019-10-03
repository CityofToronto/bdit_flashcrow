import { mapMutations } from 'vuex';

import TdsModal from '@/web/components/tds/TdsModal.vue';

export default {
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
