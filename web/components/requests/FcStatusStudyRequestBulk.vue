<template>
  <div class="fc-status-study-request-bulk">
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
            <span>{{detail.status.text}}</span>
            <span v-if="detail.n > 0">
              ({{detail.n}} / {{studyRequestBulk.studyRequests.length}})
            </span>
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
import { bulkStatus } from '@/lib/requests/RequestStudyBulkUtils';
import { afterDateOf } from '@/lib/time/TimeUtils';

export default {
  name: 'FcStatusStudyRequestBulk',
  props: {
    studyRequestBulk: Object,
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
      const { createdAt } = this.studyRequestBulk;

      let n = this.statusCounts.get(StudyRequestStatus.REQUESTED);
      const milestones = [{
        createdAt,
        status: StudyRequestStatus.REQUESTED,
        n,
      }];

      n = this.statusCounts.get(StudyRequestStatus.CHANGES_NEEDED);
      if (n > 0) {
        const changesNeeded = this.statusChanges.get(StudyRequestStatus.CHANGES_NEEDED);
        if (changesNeeded) {
          milestones.push({ ...changesNeeded, n });
        }
      } else {
        n = this.statusCounts.get(StudyRequestStatus.CANCELLED);
        if (n > 0) {
          const cancelled = this.statusChanges.get(StudyRequestStatus.CANCELLED);
          if (cancelled) {
            milestones.push({ ...cancelled, n });
          }
        }
      }

      n = this.statusCounts.get(StudyRequestStatus.ASSIGNED);
      if (n > 0 || this.progress >= 50) {
        const assigned = this.statusChanges.get(StudyRequestStatus.ASSIGNED);
        if (assigned) {
          milestones.push({ ...assigned, n });
        }
      }

      n = this.statusCounts.get(StudyRequestStatus.REJECTED);
      if (n > 0) {
        const rejected = this.statusChanges.get(StudyRequestStatus.REJECTED);
        if (rejected) {
          milestones.push({ ...rejected, n });
        }
      }

      n = this.statusCounts.get(StudyRequestStatus.COMPLETED);
      if (n > 0) {
        const completed = this.statusChanges.get(StudyRequestStatus.COMPLETED);
        if (completed) {
          milestones.push({ ...completed, n });
        }
      }

      return milestones;
    },
    progress() {
      if (this.status === StudyRequestStatus.REQUESTED) {
        const { createdAt } = this.studyRequestBulk;
        return afterDateOf(createdAt, this.now) ? 25 : 0;
      }
      if (this.status === StudyRequestStatus.CHANGES_NEEDED
        || this.status === StudyRequestStatus.CANCELLED) {
        return 25;
      }
      if (this.status === StudyRequestStatus.ASSIGNED) {
        const assigned = this.statusChanges.get(StudyRequestStatus.ASSIGNED);
        if (assigned) {
          return afterDateOf(assigned.createdAt, this.now) ? 75 : 50;
        }
        return 50;
      }
      if (this.status === StudyRequestStatus.REJECTED) {
        return 75;
      }
      // COMPLETED
      return 100;
    },
    status() {
      return bulkStatus(this.studyRequestBulk.studyRequests);
    },
    statusChanges() {
      const changesByStatus = ArrayUtils.groupBy(
        this.studyRequestChanges,
        change => change.status.ordinal,
      );
      const mostRecentChangesByStatus = changesByStatus.map(g => [g[0].status, g[0]]);
      return new Map(mostRecentChangesByStatus);
    },
    statusCounts() {
      const statusCounts = new Map(
        StudyRequestStatus.enumValues.map(
          status => [status, 0],
        ),
      );
      const { studyRequests } = this.studyRequestBulk;
      studyRequests.forEach(({ status }) => {
        const n = statusCounts.get(status);
        statusCounts.set(status, n + 1);
      });
      return statusCounts;
    },
    ...mapState(['now']),
  },
};
</script>

<style lang="scss">
.fc-status-study-request-bulk {
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
