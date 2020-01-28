<template>
  <v-dialog
    v-model="internalValue"
    :persistent="true">
    <v-card>
      <v-card-title>
        Confirmation: Request #{{studyRequest.id}}
      </v-card-title>
      <v-card-text>
        <p v-if="update">
          <span v-if="isSupervisor">
            The request has been updated.
          </span>
          <span v-else>
            Your request has been updated.
          </span>
        </p>
        <p v-else>
          Thank you for your request!  You will receive a confirmation email
          shortly.
        </p>
        <p v-if="isSupervisor">
          The estimated delivery date for this request is
          <strong>{{studyRequest.estimatedDeliveryDate | date}}</strong>.
        </p>
        <p v-else>
          You should receive your data by
          <strong>{{studyRequest.estimatedDeliveryDate | date}}</strong>.
        </p>
        <template v-if="!update">
          <p v-if="studyRequest.priority === 'URGENT'">
            You've marked this request urgent.  The Traffic Safety Unit will
            contact you to make adjustments to the schedule.
          </p>
          <p v-else>
            The Traffic Safety Unit will contact you if there are unforeseen
            scheduling changes.
          </p>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="internalValue = false">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'FcModalRequestStudyConfirmation',
  props: {
    isSupervisor: Boolean,
    studyRequest: Object,
    update: Boolean,
    value: Boolean,
  },
  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
};
</script>
