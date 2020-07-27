<template>
  <section class="pa-5">
    <div
      v-for="studyRequest in studyRequestsPending"
      :key="studyRequest.id"
      class="align-center d-flex">
      <v-icon
        color="warning"
        left>mdi-information</v-icon>
      <div>
        {{studyRequest.studyType.label}}
        has been requested on {{studyRequest.createdAt | date}}.
        <router-link :to="{
          name: 'requestStudyView',
          params: { id: studyRequest.id },
        }">View details.</router-link>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FcSectionStudyRequestsPending',
  props: {
    studyRequestsPending: Array,
  },
};
</script>
