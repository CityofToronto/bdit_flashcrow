<template>
    <div :key="'expire_' + this.changeCount">
        <v-select
            label="MVCR Permission"
            :items="options"
            v-model="selectedPermission"
            variant="underlined"
            :disabled="this.changesLoading"
            @change="handleSelection" />
            <span v-if="showExpiry">
               Access valid until: {{ parseExpiryDateTime(this.user.mvcrExpiryDate) }}
            </span>
    </div>
</template>

<script>

import TimeFormatters from '@/lib/time/TimeFormatters';
import { getUsersByIds } from '@/lib/api/WebApi';

export default {
  props: ['permissions', 'currentUser', 'isLoading'],
  data() {
    return {
      selectedPermission: this.permissions[this.currentUser.mvcrAcctType],
      options: this.permissions,
      user: this.currentUser,
      showExpiry: this.currentUser.mvcrAcctType === 1,
      changesLoading: this.isLoading,
      changeCount: 0,
    };
  },
  watch: {
    selectedPermission() {
      setTimeout(() => {
        this.updateData();
      }, 1000);
    },
    isLoading(val) {
      if (val === false) {
        this.log('changes done');
        this.changeCount += 1;
        // this.log(this.changeCount);
        this.log(this.user.mvcrAcctType);
      }
    },
  },
  methods: {
    handleSelection() {
      const newAccountType = this.options.indexOf(this.selectedPermission);
      this.user = { ...this.currentUser, mvcrAcctType: newAccountType };
      this.$emit('change', this.user);
    },
    parseExpiryDateTime(expiryDateTime) {
      return TimeFormatters.formatDateTime(expiryDateTime);
    },
    async updateData() {
      this.changesLoading = true;
      const newUserMap = await getUsersByIds([this.user.id]);
      const newUserInfo = newUserMap.entries().next().value[1];
      this.user = newUserInfo;
      this.showExpiry = newUserInfo.mvcrAcctType === 1;
      this.changesLoading = false;
    },
    log(msg) {
      // eslint-disable-next-line no-console
      console.log(msg);
    },
  },
};
</script>
