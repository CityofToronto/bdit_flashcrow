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
    <v-row class="mx-0 pt-2">
      <v-col
        v-for="(detail, i) in details"
        :key="'details_' + i"
        :class="{
          'pl-0': i !== 1,
          'pl-2': i === 1,
          'pr-0': i !== 3,
          'pr-2': i === 3,
          'text-left': i === 0,
          'text-center': 0 < i && i < 4,
          'text-right': i === 4,
        }"
        :cols="i === 2 ? 4 : 2">
        <template v-if="detail !== null">
          <div class="headline font-weight-regular">
            {{detail.status.text}}
          </div>
          <div class="mt-1 subtitle-2">
            {{detail.createdAt | date}}
          </div>
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import { StudyRequestStatus } from '@/lib/Constants';

/**
 * @param {DateTime} dt1 - date to compare against
 * @param {DateTime} dt2 - date being compared
 * @returns {boolean} whether the date `dt2` takes place on is after the date
 * `dt1` takes place on
 */
function afterDateOf(dt1, dt2) {
  const endOfDay1 = dt1.endOf('day');
  return dt2.valueOf() > endOfDay1.valueOf();
}

export default {
  name: 'FcStatusStudyRequest',
  props: {
    studyRequest: Object,
    studyRequestChanges: Array,
  },
  computed: {
    circles() {
      const circles = this.milestones.map(({ status }) => status.name);
      if (this.progress < 50) {
        circles.push('center');
      }
      if (this.progress < 100) {
        circles.push('right');
      }
      return circles;
    },
    details() {
      const details = new Array(5).fill(null);
      this.milestones.forEach((milestone) => {
        const { detailsIndex } = milestone.status;
        details[detailsIndex] = milestone;
      });
      return details;
    },
    milestones() {
      const { createdAt, status } = this.studyRequest;
      const milestones = [{
        createdAt,
        status: StudyRequestStatus.REQUESTED,
      }];

      if (status === StudyRequestStatus.REQUESTED) {
        return milestones;
      }
      if (status === StudyRequestStatus.CHANGES_NEEDED) {
        const changesNeeded = this.statusChanges.get(StudyRequestStatus.CHANGES_NEEDED);
        milestones.push(changesNeeded);
        return milestones;
      }
      if (status === StudyRequestStatus.CANCELLED) {
        const cancelled = this.statusChanges.get(StudyRequestStatus.CANCELLED);
        milestones.push(cancelled);
        return milestones;
      }

      const assigned = this.statusChanges.get(StudyRequestStatus.ASSIGNED);
      milestones.push(assigned);

      if (status === StudyRequestStatus.ASSIGNED) {
        return milestones;
      }
      if (status === StudyRequestStatus.REJECTED) {
        const rejected = this.statusChanges.get(StudyRequestStatus.REJECTED);
        milestones.push(rejected);
        return milestones;
      }
      // COMPLETED
      const completed = this.statusChanges.get(StudyRequestStatus.COMPLETED);
      milestones.push(completed);
      return milestones;
    },
    progress() {
      const { status } = this.studyRequest;
      if (status === StudyRequestStatus.REQUESTED) {
        const { createdAt } = this.studyRequest;
        return afterDateOf(createdAt, this.now) ? 25 : 0;
      }
      if (status === StudyRequestStatus.CHANGES_NEEDED
        || status === StudyRequestStatus.CANCELLED) {
        return 25;
      }
      if (status === StudyRequestStatus.ASSIGNED) {
        const { createdAt: assignedAt } = this.statusChanges.get(StudyRequestStatus.ASSIGNED);
        return afterDateOf(assignedAt, this.now) ? 75 : 50;
      }
      if (status === StudyRequestStatus.REJECTED) {
        return 75;
      }
      // COMPLETED
      return 100;
    },
    statusChanges() {
      const changesByStatus = ArrayUtils.groupBy(
        this.studyRequestChanges,
        change => change.status.ordinal,
      );
      const mostRecentChangesByStatus = changesByStatus.map(g => [g[0].status, g[0]]);
      return new Map(mostRecentChangesByStatus);
    },
    ...mapState(['now']),
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

    &.status-circle-CHANGES_NEEDED {
      background-color: var(--v-statusChangesNeeded-base);
      border: 2px solid #fff;
      left: calc(25% - 4px);
    }

    &.status-circle-CANCELLED {
      background-color: var(--v-statusCancelled-base);
      border: 2px solid #fff;
      left: calc(25% - 4px);
    }

    &.status-circle-ASSIGNED {
      background-color: var(--v-statusAssigned-base);
      border: 2px solid #fff;
      left: calc(50% - 8px);
    }

    &.status-circle-REJECTED {
      background-color: var(--v-statusRejected-base);
      border: 2px solid #fff;
      left: calc(75% - 12px);
    }

    &.status-circle-COMPLETED {
      background-color: var(--v-statusCompleted-base);
      border: 2px solid #fff;
      left: calc(100% - 16px);
    }

    &.status-circle-center {
      left: calc(50% - 8px);
    }

    &.status-circle-right {
      left: calc(100% - 16px);
    }
  }
}
</style>
