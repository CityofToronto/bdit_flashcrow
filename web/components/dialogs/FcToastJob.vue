<template>
  <FcToast
    v-model="internalValue"
    :action="action"
    :color="color"
    :text="text"
    @toast-action="actionToast" />
</template>

<script>
import { saveAs } from 'file-saver';
import { mapState } from 'vuex';

import { getStorage } from '@/lib/api/WebApi';
import { putJobDismiss } from '@/lib/api/SchedulerApi';
import JobPoller from '@/lib/jobs/JobPoller';
import FcToast from '@/web/components/dialogs/FcToast.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcToastJob',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcToast,
  },
  props: {
    job: Object,
  },
  data() {
    return {
      internalJob: this.job,
      text: null,
    };
  },
  created() {
    this.jobPoller = new JobPoller(this.job);
    this.text = this.jobPoller.textStatus;
    this.jobPoller.addEventListener(
      JobPoller.EVENT_UPDATE_JOB_STATUS,
      this.onUpdateJobStatus.bind(this),
    );
  },
  computed: {
    action() {
      const { state } = this.internalJob;
      if (state === 'completed') {
        return 'Download';
      }
      return null;
    },
    color() {
      const { state } = this.internalJob;
      if (state === 'failed') {
        return 'error';
      }
      return 'black';
    },
    ...mapState(['auth']),
  },
  methods: {
    async actionDownload() {
      const { result } = this.internalJob;
      if (result === null) {
        return;
      }

      const { namespace, key } = result;
      const storageData = await getStorage(namespace, key);
      saveAs(storageData, key);

      const job = await putJobDismiss(this.auth.csrf, this.internalJob);
      this.internalJob = job;
    },
    actionToast() {
      const { state } = this.internalJob;
      if (state === 'completed') {
        this.actionDownload();
      }
    },
    onUpdateJobStatus() {
      const { job, textStatus } = this.jobPoller;
      this.internalJob = job;
      this.text = textStatus;
    },
  },
};
</script>
