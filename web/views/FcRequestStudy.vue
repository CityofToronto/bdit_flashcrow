<template>
  <div class="fc-request-study d-flex fill-height flex-column">
    <v-toolbar class="flex-grow-0 flex-shrink-0" dense>
      <v-btn
        icon
        :to="linkBack">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-toolbar-title>New Study Request</v-toolbar-title>
    </v-toolbar>
    <section class="flex-grow-1 flex-shrink-0">
      <div class="fill-height pa-3 overflow-y-auto">
        <FcDetailsStudyRequest
          v-model="studyRequest"
          :v="$v.studyRequest" />
        <FcDetailsStudy
            v-for="(_, i) in studyRequest.studies"
            :key="i"
            v-model="studyRequest.studies[i]"
            :v="$v.studyRequest.studies.$each[i]"
            @remove-study="onRemoveStudy(i)" />
        <v-menu>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              block>
              <v-icon left>mdi-plus</v-icon>Add Study
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="{ label, value, warning } in studyTypesWithWarnings"
              :key="value"
              @click="onAddStudy(value)">
              <v-list-item-title>
                <v-icon v-if="warning !== null">mdi-alert</v-icon> {{label}}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          block
          class="mt-6"
          color="primary"
          @click="onFinish">
          {{linkFinish.label}}
        </v-btn>
      </div>
    </section>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import {
  CentrelineType,
  COUNT_TYPES,
} from '@/lib/Constants';
import { STUDY_DUPLICATE, STUDY_IRRELEVANT_TYPE } from '@/lib/i18n/ConfirmDialog';
import DateTime from '@/lib/time/DateTime';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import FcDetailsStudy from '@/web/components/FcDetailsStudy.vue';
import FcDetailsStudyRequest from '@/web/components/FcDetailsStudyRequest.vue';

function makeStudy(studyType) {
  return {
    studyType,
    daysOfWeek: [2, 3, 4],
    duration: 24,
    hours: 'ROUTINE',
    notes: '',
  };
}

export default {
  name: 'FcRequestStudy',
  components: {
    FcDetailsStudy,
    FcDetailsStudyRequest,
  },
  data() {
    // TODO: if new study request, create from scratch
    const location = {
      centrelineId: 1729,
      centrelineType: CentrelineType.INTERSECTION,
    };
    const now = DateTime.local();
    const studyRequest = {
      serviceRequestId: null,
      priority: 'STANDARD',
      assignedTo: null,
      dueDate: now.plus({ months: 3 }),
      estimatedDeliveryDate: now.plus({ months: 2, weeks: 3 }),
      reasons: ['TSC', 'PED_SAFETY'],
      ccEmails: [],
      centrelineId: 1729,
      centrelineType: CentrelineType.INTERSECTION,
      geom: {
        type: 'Point',
        coordinates: [-79.333251, 43.709012],
      },
      studies: [{
        studyType: 'TMC',
        daysOfWeek: [2, 3, 4],
        duration: null,
        hours: 'ROUTINE',
        notes: 'completely normal routine turning movement count',
      }],
    };
    return { location, studyRequest };
  },
  computed: {
    estimatedDeliveryDate() {
      const { now, studyRequest } = this;
      if (studyRequest === null) {
        return null;
      }
      const { dueDate, priority } = studyRequest;
      if (priority === 'URGENT') {
        return dueDate;
      }
      const oneWeekBeforeDueDate = dueDate.minus({ weeks: 1 });
      const twoMonthsOut = now.plus({ months: 2 });
      if (oneWeekBeforeDueDate.valueOf() < twoMonthsOut.valueOf()) {
        return twoMonthsOut;
      }
      return oneWeekBeforeDueDate;
    },
    linkBack() {
      if (this.studyRequest.id !== undefined) {
        // coming from edit flow
        const { id } = this.studyRequest;
        const route = {
          name: 'requestStudyView',
          params: { id },
        };
        if (this.isSupervisor) {
          route.query = { isSupervisor: true };
        }
        return route;
      }
      // coming from view flow
      const { centrelineId, centrelineType } = this.location;
      return {
        name: 'viewDataAtLocation',
        params: { centrelineId, centrelineType },
      };
    },
    linkFinish() {
      if (this.studyRequest.id !== undefined) {
        // coming from edit flow
        const { id } = this.studyRequest;
        const route = {
          name: 'requestStudyView',
          params: { id },
        };
        if (this.isSupervisor) {
          route.query = { isSupervisor: true };
        }
        const label = 'Save';
        return { route, label };
      }
      // coming from view flow
      const { centrelineId, centrelineType } = this.location;
      const route = {
        name: 'viewDataAtLocation',
        params: { centrelineId, centrelineType },
      };
      const label = 'Submit';
      return { route, label };
    },
    studyTypesWithWarnings() {
      const studyTypesSelected = new Set();
      this.studyRequest.studies.forEach(({ studyType: value }) => {
        studyTypesSelected.add(value);
      });
      return COUNT_TYPES.map(({ label, value }) => {
        let warning = null;
        if (studyTypesSelected.has(value)) {
          warning = STUDY_DUPLICATE.getModalOptions({ label });
        } else if (!this.studyTypesRelevantToLocation.includes(value)) {
          warning = STUDY_IRRELEVANT_TYPE.getModalOptions({ label });
        }
        return { label, value, warning };
      });
    },
    ...mapGetters(['studyTypesRelevantToLocation']),
    ...mapState(['now']),
  },
  validations: ValidationsStudyRequest.validations,
  methods: {
    onAddStudy(studyType) {
      const { warning } = this.studyTypesWithWarnings
        .find(({ value }) => value === studyType);
      if (warning === null) {
        const item = makeStudy(studyType);
        this.studyRequest.studies.push(item);
      } else {
        warning.data.action = () => {
          const item = makeStudy(studyType);
          this.studyRequest.studies.push(item);
        };
        this.setModal(warning);
      }
    },
    onFinish() {
      // const { isSupervisor, studyRequest } = this;
      // this.saveStudyRequest({ isSupervisor, studyRequest });
      this.$router.push(this.linkFinish.route);
    },
    onRemoveStudy(i) {
      this.studyRequest.studies.splice(i, 1);
    },
    ...mapMutations(['setModal']),
    ...mapActions(['saveStudyRequest']),
  },
};
</script>

<style lang="postcss">
.fc-request-study {
  max-height: 100vh;
  & > section {
    max-height: calc(100vh - 48px);
  }
}
</style>
