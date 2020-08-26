<template>
  <v-card class="fc-card-job mb-4">
    <v-card-title>
      <div>
        <h2>{{job.jobId}}</h2>
        <div class="body-1 mt-1">
          {{text}} &#x2022; {{textUpdatedAt}}
        </div>
      </div>

      <v-spacer></v-spacer>

      <FcButton
        v-if="action !== null"
        :disabled="loading"
        :loading="loading"
        type="secondary"
        v-bind="attrs"
        @click="actionCard">
        <v-icon color="primary" left>{{iconAction}}</v-icon>
        {{action}}
      </FcButton>
    </v-card-title>
  </v-card>
</template>

<script>
import { saveAs } from 'file-saver';
import { mapState } from 'vuex';

import { getStorage, putJobCancel } from '@/lib/api/WebApi';
import JobPoller from '@/lib/jobs/JobPoller';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcCardJob',
  components: {
    FcButton,
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
  beforeDestroy() {
    this.jobPoller.clearIntervals();
    this.jobPoller = null;
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
      return null;
    },
    iconAction() {
      const { state } = this.internalJob;
      if (state === 'created' || state === 'active') {
        return 'mdi-undo';
      }
      if (state === 'completed') {
        return 'mdi-download';
      }
      return null;
    },
    textUpdatedAt() {
      const { state } = this.internalJob;
      if (state === 'created') {
        const { createdAt } = this.internalJob;
        const createdAtStr = createdAt.toRelative();
        return `submitted ${createdAtStr}`;
      }
      if (state === 'active') {
        const { startedAt } = this.internalJob;
        const startedAtStr = startedAt.toRelative();
        return `started ${startedAtStr}`;
      }
      const { completedAt } = this.internalJob;
      const completedAtStr = completedAt.toRelative();
      if (state === 'completed') {
        return `completed ${completedAtStr}`;
      }
      if (state === 'failed') {
        return `failed ${completedAtStr}`;
      }
      return `last updated ${completedAtStr}`;
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
    },
    actionCard() {
      const { state } = this.internalJob;
      if (state === 'created' || state === 'active') {
        this.actionUndo();
      } else if (state === 'completed') {
        this.actionDownload();
      }
    },
    async actionUndo() {
      const job = await putJobCancel(this.auth.csrf, this.internalJob);
      this.internalJob = job;
    },
    onUpdateJobStatus() {
      const { job, textStatus } = this.jobPoller;
      this.internalJob = job;
      this.text = textStatus;
    },
  },
};
</script>
