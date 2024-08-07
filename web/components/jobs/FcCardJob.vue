<template>
  <v-card
    class="fc-card-job mb-4 ml-4"
    :class="{
      'fc-card-job-cancelled': internalJob.state === 'cancelled',
      'fc-card-job-dismissed': internalJob.dismissed,
      'fc-card-job-failed': internalJob.state === 'failed',
    }"
    flat
    outlined>
    <v-card-title>
      <div>
        <div class="headline">{{job.description}}</div>
        <div class="body-1 mt-1">
          <span v-if="isMvcrJob && job.state === completed">
            Reports ready ({{job.progressTotal}} MVCRs)</span>
          <span v-else>{{text}}</span>
          &#x2022; {{textUpdatedAt}}
        </div>
      </div>

      <v-spacer></v-spacer>

      <FcButton
        v-if="action !== null"
        :type="internalJob.dismissed ? 'secondary' : 'primary'"
        @click="actionCard">
        <v-icon left>
          {{iconAction}}
        </v-icon>
        {{action}}
        <span class="sr-only">{{job.description}}</span>
      </FcButton>
    </v-card-title>
  </v-card>
</template>

<script>
import { saveAs } from 'file-saver';
import { mapState } from 'vuex';

import { getStorage, downloadBulkMvcr } from '@/lib/api/WebApi';
import { putJobDismiss } from '@/lib/api/SchedulerApi';
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
      if (state === 'completed') {
        return 'Download';
      }
      return null;
    },
    iconAction() {
      const { state } = this.internalJob;
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
    isMvcrJob() {
      return this.job.type.id === 'COMPRESS_MVCRS';
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
    async mvcrDownload() {
      const { result } = this.internalJob;
      if (result === null) {
        return;
      }
      const { filename } = result;

      downloadBulkMvcr(filename);

      const job = await putJobDismiss(this.auth.csrf, this.internalJob);
      this.internalJob = job;
    },
    actionCard() {
      const { state } = this.internalJob;
      if (state === 'completed') {
        if (this.isMvcrJob) {
          this.mvcrDownload();
        } else {
          this.actionDownload();
        }
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

<style lang="scss">
.v-sheet.v-card.fc-card-job {
  border-left: 4px solid var(--v-primary-base);
  &.fc-card-job-cancelled,
  &.fc-card-job-failed {
    opacity: 0.5;
  }
  &.fc-card-job-dismissed {
    border-left: 1px solid var(--v-border-base);
  }
}
</style>
