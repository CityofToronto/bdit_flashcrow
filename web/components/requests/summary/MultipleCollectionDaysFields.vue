<template>
    <v-row>
      <v-col cols="6">
        <template>
          <dt class="subtitle-1">Duration</dt>
          <dd class="mt-1 display-1">
            {{study.duration | durationHuman}}
          </dd>
          <dd>
            <v-messages
              class="mt-1"
              :value="[durationCaption]" />
          </dd>
        </template>
      </v-col>
      <v-col cols="6">
        <dt class="subtitle-1">Days of Week</dt>
        <dd class="mt-1 display-1">
          {{study.daysOfWeek | daysOfWeek}}
        </dd>
        <dd>
          <v-messages
            class="mt-1"
            :value="[daysCaption]" />
        </dd>
      </v-col>
    </v-row>
  </template>

<script>

export default {
  name: 'MultipleCollectionDaysFields',
  props: {
    study: Object,
  },
  computed: {
    nHours() {
      return this.study.duration;
    },
    nDays() {
      return this.nHours / 24;
    },
    nDaysOfWeek() {
      return this.study.daysOfWeek.length;
    },
    durationCaption() {
      return `The study will be conducted for ${this.nDays} consecutive days (${this.nHours} hours)`;
    },
    daysCaption() {
      let caption = 'The study will be performed on these days';
      if (this.nDaysOfWeek > this.nDays) caption = `The study will be performed on ${this.nDays} of these days`;
      return caption;
    },
  },
};
</script>
