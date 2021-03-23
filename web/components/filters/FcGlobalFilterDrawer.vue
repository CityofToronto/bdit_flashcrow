<template>
  <v-navigation-drawer
    v-model="internalValue"
    absolute
    class="fc-global-filter-drawer"
    right
    temporary
    :width="280">
    <div
      ref="content"
      class="d-flex fill-height flex-column">
      <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-4 py-3 shading">
        <h2 class="display-1">Filter</h2>
        <v-spacer></v-spacer>
        <FcButton
          type="secondary"
          @click="actionClearAll">
          Clear All
        </FcButton>
      </div>

      <v-divider></v-divider>

      <div class="flex-grow-1 flex-shrink-1">
        TODO: filters body
      </div>

      <v-divider></v-divider>

      <div class="d-flex flex-grow-0 flex-shrink-0 px-4 py-2 shading">
        <v-spacer></v-spacer>
        <FcButton
          type="tertiary"
          @click="internalValue = false">
          Cancel
        </FcButton>
        <FcButton
          type="tertiary"
          @click="actionSave">
          Save
        </FcButton>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcGlobalFilterDrawer',
  mixins: [
    FcMixinVModelProxy(Boolean),
  ],
  components: {
    FcButton,
  },
  data() {
    return {
      previousActiveElement: null,
    };
  },
  watch: {
    internalValue() {
      if (this.internalValue) {
        this.show();
      } else {
        this.unbind();
        if (this.previousActiveElement !== null) {
          this.previousActiveElement.focus();
        }
      }
    },
  },
  beforeDestroy() {
    this.unbind();
  },
  methods: {
    actionClearAll() {

    },
    actionSave() {
      // TODO: implement this
      this.internalValue = false;
    },
    /*
     * These methods ensure that focus is trapped within the navigation drawer.  This
     * implementation is borrowed from `<v-dialog>`, which also relies on focus-trapping;
     * unfortunately, Vuetify does not make that functionality available to other
     * components.
     */
    bind() {
      window.addEventListener('focusin', this.onFocusin);
    },
    onFocusin(evt) {
      if (!evt) {
        return;
      }
      const { target } = evt;
      if (
        !!target
        // It isn't the document or the dialog body
        && ![document, this.$refs.content].includes(target)
        // It isn't inside the dialog body
        && !this.$refs.content.contains(target)
      ) {
        // Find and focus the first available element inside the dialog
        const focusable = this.$refs.content.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const el = [...focusable].find(elFocusable => !elFocusable.hasAttribute('disabled'));
        if (el) {
          el.focus();
        }
      }
    },
    show() {
      // Double nextTick to wait for lazy content to be generated
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.previousActiveElement = document.activeElement;
          this.$refs.content.focus();
          this.bind();
        });
      });
    },
    unbind() {
      window.removeEventListener('focusin', this.onFocusin);
    },
  },
};
</script>

<style lang="scss">
.fc-global-filter-drawer.v-navigation-drawer--temporary {
  z-index: 400;
}
</style>
