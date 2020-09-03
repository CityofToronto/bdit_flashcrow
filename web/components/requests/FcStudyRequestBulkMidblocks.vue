<template>
  <section>
    <h3 class="display-1">TODO: midblocks</h3>
  </section>
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyRequestBulkMidblocks',
  mixins: [FcMixinVModelProxy(Object)],
  props: {
    locations: Array,
  },
};
</script>
