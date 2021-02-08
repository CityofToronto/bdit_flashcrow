<template>
  <section>
    <h2 class="my-4">
      <span>{{title}}</span>
      <FcTextNumberTotal class="ml-2" :n="jobs.length" />
    </h2>
    <FcCardJob
      v-for="job in jobs"
      :key="job.jobId"
      :job="job" />
  </section>
</template>

<script>
import FcTextNumberTotal from '@/web/components/data/FcTextNumberTotal.vue';
import FcCardJob from '@/web/components/jobs/FcCardJob.vue';

export default {
  name: 'FcSectionJobs',
  components: {
    FcCardJob,
    FcTextNumberTotal,
  },
  props: {
    jobs: Array,
    title: String,
  },
};
</script>
