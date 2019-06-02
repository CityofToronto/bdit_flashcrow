<template>
  <button
    class="tds-button-dropdown"
    :class="{ invalid }">
    <slot name="title"></slot>
    <div class="dropdown shadow-3 text-left">
      <slot name="dropdown"></slot>
    </div>
  </button>
</template>

<script>
export default {
  name: 'TdsButtonDropdown',
  props: {
    invalid: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="postcss">
.tds-button-dropdown {
  position: relative;

  & > .dropdown {
    background: var(--white);
    border: 1px solid var(--base);
    color: var(--base-darkest);
    left: 0;
    opacity: 0;
    position: absolute;
    top: 100%;
    transition: var(--transition-short);
    visibility: hidden;
    width: calc(100% + 2px);
    z-index: var(--z-index-controls);
  }
  &.invalid > .dropdown {
    border-color: var(--error);
  }

  &:focus, &:active, &:hover {
    border-radius: var(--space-s) var(--space-s) 0 0;
  }
  &:focus > .dropdown,
  &:active > .dropdown,
  &:hover > .dropdown,
  & > .dropdown:hover {
    opacity: 1;
    transform: translate(-1px, 0);
    visibility: visible;
  }
}
</style>
