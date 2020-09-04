<template>
  <v-card
    class="fc-card-study-request"
    :class="{ selected }"
    flat>
    <v-card-title class="align-start">
      <FcIconLocationMulti
        class="mr-5"
        v-bind="iconProps" />
      <div>
        <div>{{location.description}}</div>
        <FcTextMostRecent
          class="font-weight-regular"
          :study="study" />
      </div>
    </v-card-title>
  </v-card>
</template>

<script>
import FcTextMostRecent from '@/web/components/data/FcTextMostRecent.vue';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';

export default {
  name: 'FcCardStudyRequest',
  components: {
    FcIconLocationMulti,
    FcTextMostRecent,
  },
  props: {
    iconProps: Object,
    location: Object,
    selected: Boolean,
    study: Object,
    studyRequest: Object,
  },
};
</script>

<style lang="scss">
.fc-card-study-request.theme--light.v-sheet {
  border: 2px solid var(--v-border-base);
  &.selected {
    border: 2px solid var(--v-primary-base);
  }
}
</style>
