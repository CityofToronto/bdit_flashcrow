<template>
  <FcToast
    v-model="internalValue"
    :action="action"
    :color="'black'"
    :text="text"
    :disableAutoClose=true
    @toast-action="downloadMvcr" />
</template>

<script>
import FcToast from '@/web/components/dialogs/FcToast.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';
import JobPoller from '@/lib/jobs/JobPoller';
import { getBulkMvcr, putJobDismiss } from '@/lib/api/WebApi';
import { saveAs } from 'file-saver';
import { mapState } from 'vuex';

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
      jobState: this.job.state,
      jobProgressCurrent: this.job.progressCurrent,
      actoin: null,
      downloadFilename: null,
    };
  },
  created() {
    this.jobPoller = new JobPoller(this.job);
    this.action = null;
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
    text() {
      const { jobState, jobProgressCurrent, jobProgressTotal } = this;
      // eslint-disable-next-line no-console
      console.log(jobState, jobProgressCurrent, jobProgressTotal);
      let text = 'Preparing MVCR files for download';
      if (jobState === 'created') {
        text = 'Zipping MVCRs...';
      } else if (jobState === 'active') {
        text = `Zipping MVCRs (${jobProgressCurrent} of ${jobProgressTotal})`;
      } else if (jobState === 'completed') {
        text = 'MVCRs ready for download';
      }
      return text;
    },
    jobProgressTotal() {
      return this.job.progressTotal;
    },
    ...mapState(['auth']),
  },
  methods: {
    async downloadMvcr() {
      const { downloadFilename: filename } = this;

      const fileStream = await getBulkMvcr(filename);
      saveAs(fileStream, filename);

      await putJobDismiss(this.auth.csrf, this.job);
      return true;
    },
    onUpdateJobStatus() {
      this.jobState = this.jobPoller.job.state;
      this.jobProgressCurrent = this.jobPoller.job.progressCurrent;
      if (this.jobState === 'completed') {
        this.action = 'donwload';
        this.downloadFilename = this.jobPoller.job.result.filename;
      }
    },
  },
};
</script>
