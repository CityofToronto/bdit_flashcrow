<template>
  <div>
    <p
      v-for="(line, i) in description"
      :key="i"
      class="body-1 mb-1">
      {{line}}
    </p>
  </div>
</template>

<script>
import { formatCountLocationDescription } from '@/lib/StringFormatters';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  name: 'FcPopupDetailsCollision',
  props: {
    featureDetails: Object,
  },
  computed: {
    description() {
      const collision = this.featureDetails;
      const description = [];
      if (collision === null) {
        return description;
      }

      collision.involved.forEach(({ cyclist, invage, pedestrian }) => {
        const invageQuantized = Math.floor(invage / 5) * 5;
        const invageRange = `${invageQuantized} to ${invageQuantized + 5}`;
        if (cyclist) {
          description.push(`Cyclist \u00b7 ${invageRange}`);
        } else if (pedestrian) {
          description.push(`Pedestrian \u00b7 ${invageRange}`);
        }
      });

      const { accdate } = collision;
      const accdateStr = TimeFormatters.formatDateTime(accdate);
      const dayOfWeekStr = TimeFormatters.formatDayOfWeek(accdate);
      description.push(`${accdateStr} (${dayOfWeekStr})`);

      let { street1, street2 } = collision;
      if (street1 !== null) {
        street1 = formatCountLocationDescription(street1);
        if (street2 !== null) {
          street2 = formatCountLocationDescription(street2);
          description.push(`${street1} and ${street2}`);
        } else {
          description.push(street1);
        }
      }

      return description;
    },
  },
};
</script>
