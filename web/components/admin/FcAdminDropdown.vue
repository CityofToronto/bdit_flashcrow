<!-- eslint-disable no-console -->
<template>
  <select class="dropdown" v-model="selectedPermission" @change="handleSelection">
    <option value='' :selected="true">{{ currentSelection.label }}</option>
    <option v-for="{ permissionState, permissionSlot } in
      getOptions(currentSelection, permissions)"
      :key="permissionSlot"
      :value="permissionState.label">
      <span v-if="currentSelection != permissionState.label">{{ permissionState.label }}</span>
    </option>
  </select>
</template>
<script>

export default {
  props: ['permissions', 'currentSelection', 'currentUser'],
  data() {
    return {
      selectedPermission: '',
    };
  },
  methods: {
    getOptions(selectedItem, allItems) {
      return allItems.filter(({ permissionState }) => permissionState !== selectedItem);
    },
    updateUser(mvcrPermission, user) {
      // eslint-disable-next-line no-console
      console.log(mvcrPermission);
      // eslint-disable-next-line no-console
      console.log(user);
    },
    handleSelection() {
      const permissionChange = this.selectedPermission || this.currentSelection.label;
      // const newCurrentUser =
      this.updateUser(permissionChange, this.currentUser);
      // this.$emit('change', );
    },
  },
};
</script>
