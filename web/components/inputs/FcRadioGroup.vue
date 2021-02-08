<template>
  <fieldset>
    <v-radio-group
      v-model="internalValue"
      class="mt-0"
      :label="label"
      v-bind="$attrs">
      <template v-slot:label>
        <span class="default--text headline">{{label}}</span>
      </template>
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
  </fieldset>
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
    label: String,
  },
};
</script>
