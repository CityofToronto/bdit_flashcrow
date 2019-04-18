<template>
  <fieldset class="new-request-details">
    <div class="details-body">
      <div class="details-column">
        <div class="form-group">
          <label>Reason for request?
            <v-select
              class="form-select reason-for-request"
              :options="optionsReason"
              placeholder="Select reason for request" />
          </label>
        </div>
        <div class="form-group">
          <label>Service Request Number (if applicable)
            <input type="text" />
          </label>
        </div>
      </div>
      <div class="details-column">
        <strong>Priority</strong>
        <div class="details-radios">
          <label>
            Urgent
            <input type="radio" name="hours" value="1" />
          </label>
          <label>
            Standard
            <input type="radio" name="hours" value="0" />
          </label>
        </div>
      </div>
      <div class="details-column">
        <div class="form-group">
          <label>Other staff you'd like to update:
            <input
              type="text"
              placeholder="e.g. tom.delaney@toronto.ca" />
          </label>
        </div>
      </div>
    </div>
  </fieldset>
</template>

<script>
import Constants from '@/lib/Constants';

export default {
  name: 'NewRequestDetails',
  data() {
    return {
      optionsReason: Constants.REASONS,
    };
  },
};
</script>

<style lang="postcss">
.new-request-details {
  border: none;
  margin-top: calc(var(--sp) * 4);
  & > .details-body {
    align-items: flex-start;
    display: flex;
    flex-direction: row;
    & > .details-column {
      flex: 0 0 33.3333%;
      padding: 0 calc(var(--sp) * 2);
      & > .details-radios {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        & > label {
          flex: 0 0 33.3333%;
          margin: calc(var(--sp) * 2) 0;
        }
      }
    }
  }
  .reason-for-request {
    .dropdown-menu {
      bottom: 100%;
      top: auto;
    }
  }
}
</style>
