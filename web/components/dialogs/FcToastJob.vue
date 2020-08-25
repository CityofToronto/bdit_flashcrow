<template>
  <FcToast
    v-model="internalValue"
    :action="action"
    :color="color"
    :loading="loading"
    :text="text"
    @toast-action="actionToast" />
</template>

<script>
import { mapMutations } from 'vuex';

import { getJob } from '@/lib/api/WebApi';
import DateTime from '@/lib/time/DateTime';
import FcToast from '@/web/components/dialogs/FcToast.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

const INTERVAL_TICK = 1000;
const INTERVAL_GET_JOB = 5000;

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
      loading: false,
      progressCurrentPrev: 0,
      timeRemaining: null,
    };
  },
  created() {
    this.setIntervals();
  },
  beforeDestroy() {
    this.clearIntervals();
  },
  computed: {
    action() {
      const { state } = this.job;
      if (state === 'created' || state === 'active') {
        return 'Undo';
      }
      if (state === 'completed') {
        return 'Download';
      }
      return null;
    },
    color() {
      const { state } = this.job;
      if (state === 'failed') {
        return 'error';
      }
      return 'black';
    },
    text() {
      const { progressCurrent, progressTotal, state } = this.job;
      if (state === 'created') {
        return 'Generating reports (waiting to start)';
      }
      if (progressCurrent === progressTotal) {
        return 'Archiving reports';
      }
      if (progressCurrent === 0 || this.timeRemaining === null) {
        return 'Generating reports (estimating time)';
      }
      return `Generating reports (${progressCurrent} of ${progressTotal}, ${this.textTimeRemaining})`;
    },
    textTimeRemaining() {
      if (this.timeRemaining === null) {
        return null;
      }

      let s = Math.floor(this.timeRemaining / 1000);
      let m = Math.floor(s / 60);
      const h = Math.floor(m / 60);
      m %= 60;
      s %= 60;

      if (h > 1) {
        return 'a while';
      }
      if (h === 1) {
        return `1 hour ${m} minutes`;
      }
      if (m > 1) {
        return `${m} minutes`;
      }
      if (m === 1) {
        return `1 minute ${s} seconds`;
      }
      if (s > 1) {
        return `${s} seconds`;
      }
      if (s === 1) {
        return '1 second';
      }
      return 'now';
    },
  },
  methods: {
    actionDownload() {
      /* eslint-disable-next-line no-alert */
      window.alert('Coming Soon!');
    },
    actionToast() {
      const { state } = this.job;
      if (state === 'created' || state === 'active') {
        this.actionUndo();
      } else if (state === 'completed') {
        this.actionDownload();
      }
    },
    actionUndo() {
      /* eslint-disable-next-line no-alert */
      window.alert('Coming Soon!');
    },
    clearIntervals() {
      if (this.intervalGetJob !== null) {
        window.clearInterval(this.intervalGetJob);
        this.intervalGetJob = null;
      }
      if (this.intervalTick !== null) {
        window.clearInterval(this.intervalTick);
        this.intervalTick = null;
      }
    },
    setIntervals() {
      this.intervalGetJob = window.setInterval(
        this.updateGetJob.bind(this),
        INTERVAL_GET_JOB,
      );
      this.intervalTick = window.setInterval(
        this.updateTick.bind(this),
        INTERVAL_TICK,
      );
    },
    async updateGetJob() {
      const job = await getJob(this.job.jobId);
      this.internalJob = job;

      const {
        progressCurrent,
        progressTotal,
        startedAt,
        state,
      } = this.internalJob;
      if (state !== 'created' || state !== 'active') {
        this.clearIntervals();
        this.timeRemaining = null;
      }
      if (progressCurrent === this.progressCurrentPrev) {
        return;
      }

      const now = DateTime.local();
      const elapsed = now.valueOf() - startedAt.valueOf();
      const f = progressCurrent / progressTotal;
      const timeRemaining = Math.round(elapsed * (1 - f) / f);

      this.timeRemaining = timeRemaining;
      this.progressCurrentPrev = progressCurrent;
    },
    updateTick() {
      if (this.timeRemaining === null) {
        return;
      }
      this.timeRemaining -= INTERVAL_TICK;
    },
    ...mapMutations(['clearToast']),
  },
};
</script>
