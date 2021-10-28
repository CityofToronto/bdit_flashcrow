<template>
  <div class="fc-admin-utilities">
    <FcButton
      type="primary"
      @click="recalcBulkSris">
      Recalculate Bulk SRIs
    </FcButton>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import FcButton from '@/web/components/inputs/FcButton.vue';
import { putStudyRequestItems } from '@/lib/api/WebApi';

export default {
  name: 'FcAdminUtilities',
  components: {
    FcButton,
  },
  computed: {
    ...mapState(['auth']),
  },
  methods: {
    async recalcBulkSris() {
      const response = await putStudyRequestItems(this.auth.csrf);
      return response;
    },
  },
};
</script>
