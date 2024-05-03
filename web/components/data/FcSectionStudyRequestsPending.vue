<template>
  <section class="pl-5">
    <p
      v-for="studyRequest in studyRequestsPending"
      :key="studyRequest.id"
      class="align-center d-flex mb-1 pa-3">
      <v-icon
        color="warning"
        left>mdi-information</v-icon>
      <span>
        <strong>
          {{studyRequest.studyType.label}}
          <span v-if="studyRequest.studyType.other">
            ({{studyRequest.studyTypeOther.trim()}})
          </span>
        </strong>
        has been requested on {{studyRequest.createdAt | date}}.
        <router-link :to="{
          name: 'requestStudyView',
          params: { id: studyRequest.id },
        }">View details.</router-link>
      </span>
    </p>
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
