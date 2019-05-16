<template>
<div class="fc-breadcrumbs-request-study">
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
  { name: 'requestStudy', label: 'Request' },
  { name: 'requestStudySchedule', label: 'Schedule' },
  { name: 'requestStudyConfirm', label: 'Confirm' },
];

export default {
  name: 'FcBreadcrumbsRequestStudy',
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
.fc-breadcrumbs-request-study {
  align-items: center;
  display: flex;
  flex-direction: row;
  font-size: var(--font-size-2xl);
  margin: var(--space-l) 0;
  text-transform: uppercase;
  & > .breadcrumb-step {
    color: var(--base);
    & > a, & > span {
      color: var(--base);
      display: inline-block;
      margin-left: var(--space-s);
    }
    & > .breadcrumb-step-icon {
      display: inline-block;
      height: var(--font-size-2xl);
      line-height: var(--font-size-2xl);
      text-align: center;
      width: var(--font-size-2xl);
    }
    & > strong.breadcrumb-step-icon {
      background-color: var(--base);
      border-radius: 50%;
      color: var(--base-darkest);
    }
    &.current > strong.breadcrumb-step-icon {
      background-color: var(--success-light);
      color: var(--success-darker);
    }
    &.completed:hover,
    &.completed:hover > a {
      color: var(--primary-darker);
    }
    &.completed, &.completed > a, &.completed > span {
      color: var(--base-darkest);
    }
    &.current, &.current > a, &.current > span {
      color: var(--success-darker);
    }
  }
  & > .breadcrumb-step-separator {
    border-bottom: var(--border-default);
    display: inline-block;
    flex: 1;
    height: 1px;
    margin: 0 var(--space-m);
    &.completed {
      border-color: var(--base-darkest);
    }
  }
}
</style>
