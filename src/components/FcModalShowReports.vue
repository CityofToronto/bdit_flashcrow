<template>
  <TdsModal :data="data">
    <template v-slot:header>
      <h2>Show Reports</h2>
    </template>
    <template v-slot:content>
      <p>
        Coming soon: show reports!
      </p>
      <p>
        <code>
          {{JSON.stringify(data.items, null, 2)}}
        </code>
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
import TdsMixinModal from '@/components/tds/TdsMixinModal';

export default {
  name: 'FcModalShowReports',
  mixins: [TdsMixinModal],
};
</script>

<style lang="postcss">

</style>
