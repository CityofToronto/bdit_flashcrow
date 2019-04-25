<template>
<div class="breadcrumb-steps">
  <template
    v-for="(step, i) in steps">
    <div
      :key="i"
      v-if="i > 0"
      class="breadcrumb-step-separator"
      :class="{completed: i <= currentIndex}">
      &nbsp;
    </div>
    <div
      :key="step.name"
      class="breadcrumb-step"
      :class="{
        completed: i < currentIndex,
        current: i === currentIndex
      }">
      <i
        v-if="i < currentIndex || (i === currentIndex && currentStepCompleted)"
        class="breadcrumb-step-icon fa fa-check-circle"></i>
      <strong v-else class="breadcrumb-step-icon">{{i + 1}}</strong>
      <router-link
        v-if="i < currentIndex"
        :to="{name: step.name}">{{step.label}}</router-link>
      <span v-else>{{step.label}}</span>
    </div>
  </template>
</div>
</template>

<script>

const steps = [
  { name: 'requestsNewRequest', label: 'Request' },
  { name: 'requestsNewSchedule', label: 'Schedule' },
  { name: 'requestsNewConfirm', label: 'Confirm' },
];

export default {
  name: 'BreadcrumbRequestsNew',
  props: {
    currentStepCompleted: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return { steps };
  },
  computed: {
    currentIndex() {
      return this.steps.findIndex(step => step.name === this.currentStep);
    },
    currentStep() {
      return this.$route.name;
    },
  },
};
</script>

<style lang="postcss">
.breadcrumb-steps {
  align-items: center;
  display: flex;
  flex-direction: row;
  font-size: var(--text-xxl);
  margin-bottom: calc(var(--sp) * 4);
  text-transform: uppercase;
  & > .breadcrumb-step {
    color: var(--outline-grey);
    & > a, & > span {
      color: var(--outline-grey);
      display: inline-block;
      margin-left: var(--sp);
    }
    & > .breadcrumb-step-icon {
      display: inline-block;
      height: var(--text-xxl);
      line-height: var(--text-xxl);
      text-align: center;
      width: var(--text-xxl);
    }
    & > strong.breadcrumb-step-icon {
      background-color: var(--outline-grey);
      border-radius: 50%;
      color: var(--outline-grey-focus);
    }
    &.current > strong.breadcrumb-step-icon {
      background-color: var(--light-green);
      color: var(--green);
    }
    &.completed:hover,
    &.completed:hover > a {
      color: var(--blue);
    }
    &.completed, &.completed > a, &.completed > span {
      color: var(--off-black);
    }
    &.current, &.current > a, &.current > span {
      color: var(--green);
    }
  }
  & > .breadcrumb-step-separator {
    border-bottom: 1px solid var(--outline-grey);
    display: inline-block;
    flex: 1;
    height: 1px;
    margin: 0 calc(var(--sp) * 2);
    &.completed {
      border-color: var(--off-black);
    }
  }
}
</style>
