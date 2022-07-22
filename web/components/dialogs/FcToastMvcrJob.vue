<template>
  <FcToast
    v-model="internalValue"
    :action="action"
    :color="color"
    :text="text"
    @toast-action="downloadMvcr" />
</template>

<script>
import FcToast from '@/web/components/dialogs/FcToast.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';
import JobPoller from '@/lib/jobs/JobPoller';

export default {
  name: 'FcToastMvcrJob',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcToast,
  },
  props: {
    job: Object,
  },
  data() {
    return {
      text: 'Zipping MVCRs for download',
    };
  },
  created() {
    this.jobPoller = new JobPoller(this.job);
    this.jobPoller.addEventListener(
      JobPoller.EVENT_UPDATE_JOB_STATUS,
      this.onUpdateJobStatus.bind(this),
    );
  },
  beforeDestroy() {
    this.jobPoller.clearIntervals();
    this.jobPoller = null;
  },
  computed: {
    action() {
      return 'Download';
    },
    color() {
      return 'black';
    },
  },
  methods: {
    onUpdateJobStatus() {
      if (this.jobPoller.jobStatus === 'completed') {
        this.text = 'MVCRs ready for download';
      }
    },
  },
};
</script>
