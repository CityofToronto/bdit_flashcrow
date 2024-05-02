<template>
    <div :key="'expire_' + this.changeCount" class="fc_admin_dropdown">
        <v-select
            label="MVCR Permission"
            :items="options"
            v-model="selectedPermission"
            :disabled="this.changesLoading"
            class="fc_admin_dropdown_items"
            @change="handleSelection" />
            <div v-if="showExpiry" class="fc_admin_dropdown_items">
               <span class="fc_admin_dropdown_span">Access valid until:</span> <br />
               <span class="fc_admin_dropdown_span">
                {{ parseExpiryDateTime(this.user.mvcrExpiryDate) }}
              </span>
            </div>
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
      // eslint-disable-next-line no-console
      this.showExpiry = this.currentUser.mvcrAcctType === 1;
      // Need to watch this... I don't like it, but it will return
      // the previous data since it exists and the new data hasn't
      // overwritten it yet.
      setTimeout(() => {
        this.updateData();
      }, 750);
    },
    isLoading(val) {
      if (val === false) {
        this.changeCount += 1;
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
  },
};
</script>

<style scoped>
.fc_admin_dropdown {
  display: flex;
  padding: 5px 0;
}

.fc_admin_dropdown_items {
  width: 200px;
  flex: 1;
  margin: auto 10px auto 0;
}

.fc_admin_dropdown_span {
  font-style: italic;
}
</style>
