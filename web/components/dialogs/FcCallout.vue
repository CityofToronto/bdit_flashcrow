<template>
  <div :class="type">
          <div class="ma-3">
            <v-icon :color="iconColor">{{ icon }}</v-icon>
          </div>
          <slot class="ml-1 mr-2 pa-2">
           Error getting data
          </slot>
        </div>
</template>

<script>

/* This is a generic 'callout' component. We can set our
 * class, callout icon color, and callout message via props
*/

export default {
  name: 'FcCallout',
  props: {
    calloutMessage: String,
    icon: String,
    iconColor: String,
    type: String,
  },
};
</script>

<style scoped lang="scss">
.error-callout {
    display: flex;
    align-items: center;
    background-color: #ff0606e7;
    color: #ffff;
    border-radius: 5px;
    min-height: 60px;
    font-size: 18px;
    & > a {
      color: black;
    }
  }
</style>
