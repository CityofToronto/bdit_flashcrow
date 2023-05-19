<template>
  <v-textarea
    v-model="internalValue"
    class="fc-textarea"
    counter
    :label="label"
    no-resize
    outlined
    :rows="rows"
    v-bind="$attrs" />
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';
import DomIdGenerator from '@/web/ui/DomIdGenerator';

const PREFIX_DOM_ID = 'textarea';

export default {
  name: 'FcTextarea',
  mixins: [FcMixinVModelProxy(String)],
  props: {
    label: String,
    rows: {
      type: Number,
      default: 4,
    },
  },
  mounted() {
    const idCounter = DomIdGenerator.generateId(PREFIX_DOM_ID);

    const $counter = this.$el.querySelector('.v-counter');
    $counter.id = idCounter;

    const $textarea = this.$el.querySelector('textarea');
    $textarea.setAttribute('aria-describedby', idCounter);
  },
};
</script>
