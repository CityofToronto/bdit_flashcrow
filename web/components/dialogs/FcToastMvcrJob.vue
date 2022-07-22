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
      text: 'Zipping MVCRs for download',
      actoin: null,
      downloadFilename: null,
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
    color() {
      return 'black';
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
      if (this.jobPoller.jobStatus === 'completed') {
        this.action = 'donwload';
        this.text = 'MVCRs ready for download';
        this.downloadFilename = this.jobPoller.job.result.filename;
      }
    },
  },
};
</script>
