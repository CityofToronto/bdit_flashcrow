<template>
  <div>
    <v-select
      class='study-options'
      v-model="internalStudyType"
      :error-messages="errorMessagesStudyType"
      :menu-props="{ closeOnContentClick: true, maxHeight: 206, maxWidth: 500 }"
      hide-details="auto"
      :items="itemsStudyType"
      label="Study Type"
      :of-type="StudyType"
      outlined
      v-bind="$attrs">
      <template v-slot:selection="{ index }">
      <span v-if="index === 0">
        {{ selectedOptionItem.label }}
      </span>
    </template>
    <template v-slot:item="{ item }">
      <v-list-item
        @click="internalStudyType = alternativeStudiesOptionItemByIndex(item).value"
        :class="{ blank: alternativeStudiesOptionItemByIndex(item).value === null}"
        class='alternative-studies-option'>
        <v-list-item-content>
          <v-list-item-title>
            {{ item.text }}
          </v-list-item-title>
          <v-list-item-subtitle v-if="item.subtitle !== ''">
            {{ item.subtitle }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>
    </v-select>

    <template v-if="v.studyType.$model !== null && v.studyType.$model.other">
      <v-text-field
        v-model="v.studyTypeOther.$model"
        class="mt-4"
        :error-messages="errorMessagesStudyTypeOther"
        hide-details="auto"
        label="Other Study Type"
        outlined
        :success="v.studyTypeOther.$model && !v.studyTypeOther.$invalid"
        v-bind="$attrs" />
    </template>
  </div>
</template>

<script>
import { StudyType } from '@/lib/Constants';
import { getLocationStudyTypes } from '@/lib/geo/CentrelineUtils';
import {
  REQUEST_STUDY_REQUIRES_STUDY_TYPE,
  REQUEST_STUDY_REQUIRES_STUDY_TYPE_OTHER,
} from '@/lib/i18n/Strings';

function toInternalStudyType(studyType) {
  if (studyType === null) {
    return null;
  }
  return studyType.name;
}

function fromInternalStudyType(internalStudyType) {
  if (internalStudyType === null) {
    return null;
  }
  return StudyType.enumValueOf(internalStudyType);
}

export default {
  name: 'FcStudyRequestStudyType',
  props: {
    location: Object,
    v: Object,
  },
  data() {
    return {
      studyTypeOther: null,
      StudyType,
    };
  },
  methods: {
    alternativeStudiesOptionItemByIndex(internalStudyType) {
      const item = {
        text: internalStudyType.text,
        subtitle: internalStudyType.subtitle,
        value: internalStudyType.value,
      };

      return item;
    },
  },
  computed: {
    selectedOptionItem() {
      const currentValue = this.studyType;
      return currentValue;
    },
    errorMessagesStudyType() {
      const errors = [];
      if (!this.v.studyType.required) {
        errors.push(REQUEST_STUDY_REQUIRES_STUDY_TYPE.text);
      }
      return errors;
    },
    errorMessagesStudyTypeOther() {
      const errors = [];
      if (!this.v.studyTypeOther.requiredIfOtherStudyType) {
        errors.push(REQUEST_STUDY_REQUIRES_STUDY_TYPE_OTHER.text);
      }
      return errors;
    },
    studyType: {
      get() {
        return this.v.studyType.$model;
      },
      set(internalStudyType) {
        this.v.studyType.$model = fromInternalStudyType(internalStudyType);
      },
    },
    internalStudyType: {
      get() {
        return toInternalStudyType(this.v.studyType.$model);
      },
      set(internalStudyType) {
        this.v.studyType.$model = fromInternalStudyType(internalStudyType);
      },
    },
    itemsStudyType() {
      const locationStudyTypes = getLocationStudyTypes(this.location);

      return [
        ...locationStudyTypes.map(({ label, name, subtitle }) => ({
          text: label,
          value: name,
          subtitle,
        })),
        { text: 'Other', value: 'OTHER', subtitle: 'Other studies to observe specific traffic behaviour. For example, left-turn, queue-delay, origin-destination, parking occupancy, radar gun.' },
      ];
    },
  },
  beforeMount() {
    /* This little nugget is to check if the study that is being pulled up is
    ** an older ATR_SPEED_VOLUME study. If so, we convert it to the new ATR_SVC
    ** type before displaying on the UI.
    */
    if (this.v.studyType.$model === StudyType.ATR_SPEED_VOLUME) {
      this.v.studyType.$model = StudyType.ATR_SVC;
    }
  },
  watch: {
    'v.studyType.$model.other': function watchStudyTypeOther(other) {
      if (other) {
        this.v.studyTypeOther.$model = this.studyTypeOther;
      } else {
        this.studyTypeOther = this.v.studyTypeOther.$model;
        this.v.studyTypeOther.$model = null;
      }
    },
  },
};
</script>
<style scoped>
.study-options .v-select__selections span {
  max-width: 300px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow:hidden;
}

.v-list-item__content {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}

.blank.alternative-studies-option {
    display: none !important;
}

.v-list-item__subtitle{
  white-space: pre-line;
  font-weight: 600 !important;
}
</style>
