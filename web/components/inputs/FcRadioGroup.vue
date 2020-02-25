<template>
  <v-radio-group
    v-model="internalValue"
    v-bind="$attrs">
    <template v-for="(item, i) in items">
      <v-radio
        :key="'radio_' + item.value"
        :hint="item.hint"
        :value="item.value">
        <template v-slot:label>
          <div>
            <span>{{item.label}}</span>
            <template v-if="item.sublabel">
              <br>
              <span class="subtitle-2">{{item.sublabel}}</span>
            </template>
          </div>
        </template>
      </v-radio>
      <v-messages
        v-if="item.hint"
        :key="'hint_' + item.value"
        :class="{
          'mb-3': i !== items.length - 1
        }"
        :value="[item.hint]"></v-messages>
    </template>
  </v-radio-group>
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcRadioGroup',
  mixins: [FcMixinVModelProxy()],
  props: {
    items: {
      type: Array,
      default() { return []; },
    },
  },
  mounted() {
    if (!this.$attrs.label) {
      /*
       * In this case, Vuetify still generates an `aria-labelledby` attribute, but does not
       * generate a label to go along with it.
       */
      const radioGroup = this.$el.querySelector('[role=radiogroup]');
      radioGroup.removeAttribute('aria-labelledby');
    }
  },
};
</script>
