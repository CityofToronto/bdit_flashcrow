<template>
  <section class="fc-request-study-bulk-view d-flex flex-column fill-height">
    <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-3 py-2 shading">
      <FcButton
        type="secondary"
        @click="actionNavigateBack">
        <v-icon left>mdi-chevron-left</v-icon>
        {{labelNavigateBack}}
      </FcButton>
      <h1 class="flex-grow-1 headline text-center">
        <span>
          Bulk Request #{{$route.params.id}}:
        </span>
        <v-progress-circular
          v-if="loading"
          color="primary"
          indeterminate
          :size="20"
          :width="2" />
        <span
          v-else
          class="font-weight-regular">
          {{studyRequestBulk.name}}
        </span>
      </h1>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FcRequestStudyBulkView',
};
</script>

<style lang="scss">
.fc-request-study-bulk-view {
  max-height: calc(100vh - 52px);
  width: 100%;
}
</style>
