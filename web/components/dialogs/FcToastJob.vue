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
import { saveAs } from 'file-saver';
import { mapMutations, mapState } from 'vuex';

import { getJob, getStorage, putJobCancel } from '@/lib/api/WebApi';
import DateTimeZone from '@/lib/time/DateTimeZone';
import FcToast from '@/web/components/dialogs/FcToast.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

const INTERVAL_TICK = 1000;
const INTERVAL_GET_JOB = 3000;

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
      const { state } = this.internalJob;
      if (state === 'created' || state === 'active') {
        return 'Undo';
      }
      if (state === 'completed') {
        return 'Download';
      }
      return 'Close';
    },
    color() {
      const { state } = this.internalJob;
      if (state === 'failed') {
        return 'error';
      }
      return 'black';
    },
    text() {
      const { progressCurrent, progressTotal, state } = this.internalJob;
      if (state === 'created') {
        return 'Generating reports';
      }
      if (state === 'active') {
        if (progressCurrent === progressTotal) {
          return `Archiving reports (${progressTotal} reports)`;
        }
        if (progressCurrent === 0 || this.textTimeRemaining === null) {
          return `Generating reports (${progressCurrent} of ${progressTotal})`;
        }
        return `Generating reports (${progressCurrent} of ${progressTotal}, ${this.textTimeRemaining})`;
      }
      if (state === 'completed') {
        return `Reports ready (${progressTotal} reports)`;
      }
      if (state === 'failed') {
        return 'Reports failed';
      }
      return null;
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
    ...mapState(['auth']),
  },
  methods: {
    async actionDownload() {
      const { result } = this.internalJob;
      if (result === null) {
        return;
      }

      this.loading = true;

      const { namespace, key } = result;
      const storageData = await getStorage(namespace, key);
      saveAs(storageData, key);

      this.loading = false;
    },
    actionToast() {
      const { state } = this.internalJob;
      if (state === 'created' || state === 'active') {
        this.actionUndo();
      } else if (state === 'completed') {
        this.actionDownload();
      }
    },
    async actionUndo() {
      this.loading = true;

      const job = await putJobCancel(this.auth.csrf, this.internalJob);
      this.internalJob = job;

      this.loading = false;
    },
    clearIntervals() {
      console.log('clearIntervals');
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
      if (state !== 'created' && state !== 'active') {
        this.clearIntervals();
        this.timeRemaining = null;
      }
      if (progressCurrent === this.progressCurrentPrev) {
        return;
      }
      if (progressCurrent === progressTotal) {
        this.timeRemaining = null;
      }

      const now = DateTimeZone.utc();
      let elapsed = now.valueOf() - startedAt.valueOf();
      if (elapsed < INTERVAL_GET_JOB) {
        elapsed = INTERVAL_GET_JOB;
      }
      const f = progressCurrent / progressTotal;
      const timeRemaining = Math.round(elapsed * (1 - f) / f);

      this.timeRemaining = timeRemaining;
      this.progressCurrentPrev = progressCurrent;
    },
    updateTick() {
      if (this.timeRemaining === null) {
        return;
      }
      if (this.timeRemaining <= INTERVAL_TICK) {
        this.timeRemaining = 0;
      } else {
        this.timeRemaining -= INTERVAL_TICK;
      }
    },
    ...mapMutations(['clearToast']),
  },
};
</script>
