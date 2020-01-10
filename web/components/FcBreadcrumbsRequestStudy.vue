<template>
<div class="fc-breadcrumbs-request-study font-size-l">
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
      <v-icon
        v-if="i < currentIndex || (i === currentIndex && currentStepCompleted)">
        mdi-check-circle
      </v-icon>
      <strong v-else class="breadcrumb-step-icon text-center">{{i + 1}}</strong>
      <router-link
        v-if="i < currentIndex"
        :to="{name: step.name}">{{step.label}}</router-link>
      <span v-else>{{step.label}}</span>
    </div>
  </template>
</div>
</template>

<script>

const ROUTES_CREATE = [
  'requestStudy',
  'requestStudySchedule',
  'requestStudySpecify',
  'requestStudyConfirm',
];

const ROUTES_EDIT = [
  'requestStudyEdit',
  'requestStudyEditSchedule',
  'requestStudyEditSpecify',
  'requestStudyEditConfirm',
];

const LABELS = [
  'Request',
  'Schedule',
  'Specify',
  'Confirm',
];

export default {
  name: 'FcBreadcrumbsRequestStudy',
  props: {
    currentStepCompleted: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    currentIndex() {
      return this.steps.findIndex(step => step.name === this.currentStep);
    },
    currentStep() {
      return this.$route.name;
    },
    steps() {
      const { params } = this.$route;
      const routes = ROUTES_CREATE.includes(this.currentStep) ? ROUTES_CREATE : ROUTES_EDIT;
      return routes.map((name, i) => ({
        name,
        label: LABELS[i],
        params,
      }));
    },
  },
};
</script>

<style lang="postcss">
.fc-breadcrumbs-request-study {
  align-items: center;
  display: flex;
  flex-direction: row;
  margin: var(--space-l) 0;
  text-transform: uppercase;
  & > .breadcrumb-step {
    color: var(--disabled-dark);
    & > a,
    & > span {
      color: var(--disabled-dark);
      display: inline-block;
      margin-left: var(--space-s);
    }
    & > .breadcrumb-step-icon {
      display: inline-block;
      height: var(--font-size-xl);
      width: var(--font-size-xl);
    }
    & > strong.breadcrumb-step-icon {
      background-color: var(--disabled-light);
      border-radius: 50%;
      color: var(--disabled-dark);
    }
    &.current > strong.breadcrumb-step-icon {
      background-color: var(--success-light);
      color: var(--success-darker);
    }
    &.current,
    &.current > a,
    &.current > span {
      color: var(--success-darker);
    }
    &.completed,
    &.completed > a,
    &.completed > span {
      color: var(--ink);
    }
    &.completed:hover,
    &.completed:hover > a {
      color: var(--primary-darker);
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
