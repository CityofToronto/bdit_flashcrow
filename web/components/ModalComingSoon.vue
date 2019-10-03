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
        <button class="tds-button-primary" @click="clearModal">OK</button>
      </div>
    </template>
  </TdsModal>
</template>

<script>
import TdsMixinModal from '@/web/components/tds/TdsMixinModal';

export default {
  name: 'ModalComingSoon',
  mixins: [TdsMixinModal],
};
</script>
