<template>
  <section>
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
  },
};
</script>
