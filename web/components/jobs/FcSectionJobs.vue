<template>
  <section>
    <h2 class="my-4">
      <span>{{title}}</span>
      <v-chip class="ml-2" small>{{jobs.length}}</v-chip>
    </h2>
    <FcCardJob
      v-for="job in jobs"
      :key="job.jobId"
      :job="job" />
  </section>
</template>

<script>
import FcCardJob from '@/web/components/jobs/FcCardJob.vue';

export default {
  name: 'FcSectionJobs',
  components: {
    FcCardJob,
  },
  props: {
    jobs: Array,
    title: String,
  },
};
</script>
