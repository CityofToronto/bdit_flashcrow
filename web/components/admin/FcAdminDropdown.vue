<template>
    <div>
        <v-select
            label="MVCR Permission"
            :items="options"
            v-model="selectedPermission"
            variant="underlined"
            @change="handleSelection" />
    </div>
</template>

<script>

export default {
  props: ['permissions', 'currentUser'],
  data() {
    return {
      selectedPermission: this.permissions[this.currentUser.mvcrAcctType],
      options: this.permissions,
    };
  },
  methods: {
    handleSelection() {
      const newAccountType = this.options.indexOf(this.selectedPermission);
      const updatedUser = { ...this.currentUser, mvcrAcctType: newAccountType };
      this.$emit('change', updatedUser);
    },
    log(msg) {
      // eslint-disable-next-line no-console
      console.log(msg);
    },
  },
};
</script>
