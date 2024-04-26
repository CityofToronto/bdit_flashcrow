<template>
  <div>
    <select class="dropdown" v-model="selectedPermission" @change="handleSelection">
      <option value='' :selected="true">{{ currentSelection.label }}</option>
      <option v-for="{ permissionState, permissionSlot } in
        getOptions(currentSelection, permissions)" :key="permissionSlot" :value="permissionState">
        <span>{{ permissionState.label }}</span>
      </option>
    </select>
    <span v-if="currentSelection == '1'">
      Access valid until: {{ parseExpiryDateTime(currentUser.mvcrExpiryDate) }}
    </span>
  </div>
</template>
<script>
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  props: ['permissions', 'currentSelection', 'currentUser'],
  data() {
    return {
      selectedPermission: '',
    };
  },
  methods: {
    parseExpiryDateTime(expiryDateTime) {
      return TimeFormatters.formatDateTime(expiryDateTime);
    },
    getOptions(selectedItem, allItems) {
      return allItems.filter(({ permissionState }) => permissionState !== selectedItem);
    },
    updateUser(mvcrPermission, user) {
      const permissionId = mvcrPermission.ordinal;
      const updatedUser = { ...user, mvcrAcctType: permissionId };
      return updatedUser;
    },
    handleSelection() {
      const permissionChange = this.selectedPermission || this.currentSelection;
      const newUserPermission = this.updateUser(permissionChange, this.currentUser);
      this.$emit('change', newUserPermission);
    },
  },
};
</script>
