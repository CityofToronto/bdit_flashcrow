<template>
  <div class="fc-status-study-request">
    <v-progress-linear
      background-color="border"
      class="status-progress"
      color="primary"
      :value="progress" />
    <div
      v-for="circle in circles"
      :key="'circle_' + circle"
      class="status-circle"
      :class="'status-circle-' + circle"></div>
    <v-row class="pt-2">
      <v-col
        v-for="({ date, status }, i) in details"
        :key="'details_' + i"
        :class="{
          'text-left': i === 0,
          'text-center': i === 1,
          'text-right': i === 2,
        }"
        cols="4">
        <div class="headline font-weight-regular">
          {{status}}
        </div>
        <v-messages
          class="mt-1"
          :value="[date]"></v-messages>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { StudyRequestStatus } from '@/lib/Constants';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  name: 'FcStatusStudyRequest',
  props: {
    studyRequest: Object,
  },
  computed: {
    circles() {
      return [
        'REQUESTED',
        'center',
        'right',
      ];
    },
    details() {
      const detailsRequested = {
        date: TimeFormatters.formatDefault(this.studyRequest.createdAt),
        status: StudyRequestStatus.REQUESTED.text,
      };

      // TODO: add to this

      return [detailsRequested];
    },
    progress() {
      // TODO: implement this

      return 25;
    },
  },
};
</script>

<style lang="scss">
.fc-status-study-request {
  position: relative;

  & > .status-progress {
    left: 8px;
    position: absolute;
    top: 6px;
    width: calc(100% - 16px);
    z-index: 1;
  }

  & > .status-circle {
    background-color: #fff;
    border: 3px solid var(--v-border-base);
    border-radius: 8px;
    position: absolute;
    height: 16px;
    top: 0;
    width: 16px;
    z-index: 2;

    &.status-circle-REQUESTED {
      background-color: var(--v-statusRequested-base);
      border: 2px solid #fff;
      left: 0;
    }

    &.status-circle-center {
      left: calc(50% - 8px);
    }

    &.status-circle-right {
      right: 0;
    }
  }
}
</style>
