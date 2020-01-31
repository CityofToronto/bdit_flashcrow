<template>
  <v-radio-group
    v-model="internalValue">
    <template v-for="(item, i) in items">
      <v-radio
        :key="'radio_' + item.value"
        :class="{
          'mb-6': !!item.sublabel && i !== items.length - 1
        }"
        :hint="item.hint"
        :value="item.value">
        <template v-slot:label>
          <div :class="{
            'pt-5': !!item.sublabel,
          }">
            <span>{{item.label}}</span>
            <template v-if="item.sublabel">
              <br>
              <span class="caption">{{item.sublabel}}</span>
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
  mixins: [FcMixinVModelProxy([Boolean, Number, String])],
  props: {
    items: {
      type: Array,
      default() { return []; },
    },
  },
};
</script>
