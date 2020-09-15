<template>
  <section class="pa-5">
    <div
      v-for="studyRequestBulk in studyRequestsBulkPending"
      :key="studyRequestBulk.id"
      class="align-center d-flex mb-1">
      <v-icon
        color="warning"
        left>mdi-information</v-icon>
      <div>
        <strong>{{studyRequestBulk.name}}</strong>
        has been requested on {{studyRequestBulk.createdAt | date}}.
        <router-link :to="{
          name: 'requestStudyBulkView',
          params: { id: studyRequestBulk.id },
        }">View details.</router-link>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FcSectionStudyRequestsBulkPending',
  props: {
    studyRequestsBulkPending: Array,
  },
};
</script>
