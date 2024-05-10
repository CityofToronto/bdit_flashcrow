<template>
  <div>
  <v-row class="mb-6" tag="dl">
    <v-col
      v-for="({ cols, name, value, subtext }, i) in entries"
      :key="i"
      :cols="cols">
      <dt class="subtitle-1 font-weight-medium">{{name}}</dt>
      <dd class="mt-1 display-1 font-weight-medium">
        <FcTextReportValue
          text-null="None"
          :value="value" />
      </dd>
      <dd v-if="subtext != null" class="v-messages theme--light subtext">
        <FcTextReportValue
          :value="subtext" />
      </dd>
    </v-col>
  </v-row>

  <div class="callout-container" v-if="this.showCallOut">
    <div class="callout ma-3">
      <div class="ma-3">
        <v-icon color="blue">mdi-information</v-icon>
      </div>
      <div class="ml-1 mr-2 pr-2 py-2">
        For an in-depth explanation of how to interpret this data,
        <a class="link" href="https://bditto.notion.site/How-to-interpret-a-TMC-Summary-Report-310c8b7e9ca74b18b99aadc50dc27196" target="_blank" rel="noopener noreferrer">
          see here
        </a>
      </div>
    </div>
  </div>

</div>
</template>

<script>
import FcTextReportValue from '@/web/components/data/FcTextReportValue.vue';

export default {
  name: 'FcReportMetadata',
  components: {
    FcTextReportValue,
  },
  props: {
    entries: Array,
  },
  computed: {
    showCallOut() {
      return this.$parent.type && this.$parent.type.name === 'COUNT_SUMMARY_TURNING_MOVEMENT';
    },
  },
};
</script>

<style lang="scss">
.callout {
  display: flex;
  align-items: center;
  background-color: #ebf6fe;
  color: black;
  border-radius: 5px;
  min-height: 60px;
  font-size: 14px;
  max-width: 300px;
}
.callout-container {
  display: flex;
  justify-content: flex-end;
}
.subtext {
  width: 60%;
}

// only show callout button if there's room
@media only screen and (max-width: 800px) {
  .callout {
    display: none !important;
  }
}

</style>
