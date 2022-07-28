<template>
  <FcToast
    v-model="internalValue"
    :action="action"
    :color="'black'"
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
      jobState: this.job.state,
      action: null,
      eta: null,
    };
  },
  created() {
    this.jobPoller = new JobPoller(this.job);
    this.jobPoller.addEventListener(
      JobPoller.EVENT_UPDATE_JOB_STATUS,
      this.onUpdateJobStatus.bind(this),
    );
    this.jobApproxDurationSecs = Math.ceil(this.jobProgressTotal / 30);
  },
  beforeDestroy() {
    this.jobPoller.clearIntervals();
    this.jobPoller = null;
  },
  computed: {
    text() {
      const { jobState, jobProgressTotal } = this;
      let text = `Preparing ${jobProgressTotal} MVCRs for download`;
      if (jobState === 'active') {
        text = `Zipping ${jobProgressTotal} MVCRs (${this.eta}s)`;
      } else if (jobState === 'completed') {
        text = 'MVCRs ready for download';
      }
      return text;
    },
    jobProgressTotal() {
      return this.job.progressTotal;
    },
    jobIsActive() {
      return this.jobState === 'active';
    },
    jobIsComplete() {
      return this.jobState === 'completed';
    },
    ...mapState(['auth']),
  },
  methods: {
    async downloadMvcr() {
      const { filename } = this.jobPoller.job.result;

      const fileStream = await getBulkMvcr(filename);
      saveAs(fileStream, filename);

      await putJobDismiss(this.auth.csrf, this.job);
      return true;
    },
    etaCountdown() {
      let didCountdown = false;
      if (this.eta === null) {
        this.eta = this.jobApproxDurationSecs;
        setTimeout(this.etaCountdown, 1000);
      } else if (this.eta > 0) {
        this.eta -= 1;
        if (this.eta !== 0) setTimeout(this.etaCountdown, 1000);
        didCountdown = true;
      }
      // eslint-disable-next-line no-console
      console.log(didCountdown, this.eta);
      return didCountdown;
    },
    onUpdateJobStatus() {
      this.jobState = this.jobPoller.job.state;
      if (this.jobIsActive) {
        if (this.eta === null) this.etaCountdown();
      } else if (this.jobIsComplete) {
        this.action = 'donwload';
      }
    },
  },
};
</script>
