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
import { downloadBulkMvcr } from '@/lib/api/WebApi';
import { putJobDismiss } from '@/lib/api/SchedulerApi';
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
  computed: {
    text() {
      const { jobState, jobProgressTotal } = this;
      let text = `Preparing ${jobProgressTotal} MVCRs`;
      if (jobState === 'active') {
        text += ` (ready in ${this.eta} seconds)`;
      } else if (jobState === 'completed') {
        text = `Reports ready (${jobProgressTotal} MVCRs)`;
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
      downloadBulkMvcr(filename);
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
      return didCountdown;
    },
    onUpdateJobStatus() {
      this.jobState = this.jobPoller.job.state;
      if (this.jobIsActive) {
        if (this.eta === null) this.etaCountdown();
      } else if (this.jobIsComplete) {
        this.action = 'download';
      }
    },
  },
};
</script>
