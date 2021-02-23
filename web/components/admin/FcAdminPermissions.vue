<template>
  <div class="fc-admin-permissions">
    <FcDataTable
      class="fc-data-table-users"
      :columns="columns"
      :items="users"
      :loading="loading"
      must-sort
      sort-by="UNIQUE_NAME"
      :sort-desc="false"
      :sort-keys="sortKeys">
      <template v-slot:item.UNIQUE_NAME="{ item }">
        <span>{{item | username}}</span>
      </template>
      <template
        v-for="{ authScope, itemSlot } of authScopeSlots"
        v-slot:[itemSlot]="{ item }">
        <div
          :key="'u:' + item.id + ':' + authScope.name"
          class="d-flex">
          <FcTooltip right>
            <template v-slot:activator="{ on }">
              <v-checkbox
                v-model="item.scope"
                class="mt-0 pt-0"
                :disabled="loadingChangeUserScope"
                hide-details
                :value="authScope"
                @change="actionChangeUserScope(item)"
                v-on="on"></v-checkbox>
            </template>
            <span>
              <span v-if="item.scope.includes(authScope)">
                Deny {{authScope.name}}
              </span>
              <span v-else>
                Grant {{authScope.name}}
              </span>
            </span>
          </FcTooltip>
        </div>
      </template>
    </FcDataTable>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import { AuthScope } from '@/lib/Constants';
import { formatUsername } from '@/lib/StringFormatters';
import { getUsers, putUser } from '@/lib/api/WebApi';
import FcDataTable from '@/web/components/FcDataTable.vue';
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcAdminPermissions',
  mixins: [
    FcMixinRouteAsync,
  ],
  components: {
    FcDataTable,
    FcTooltip,
  },
  data() {
    const authScopeSlots = AuthScope.enumValues.map((authScope) => {
      const { name } = authScope;
      const itemSlot = `item.${name}`;
      return { authScope, itemSlot };
    });
    const columns = [
      {
        value: 'UNIQUE_NAME',
        text: 'User',
      },
      ...AuthScope.enumValues.map(({ name }) => ({
        value: name,
        text: name,
      })),
    ];
    const sortKeys = {
      UNIQUE_NAME: formatUsername,
    };
    return {
      authScopeSlots,
      columns,
      loadingChangeUserScope: false,
      sortKeys,
      users: [],
    };
  },
  computed: {
    ...mapState(['auth']),
  },
  methods: {
    async actionChangeUserScope(user) {
      this.loadingChangeUserScope = true;
      await putUser(this.auth.csrf, user);
      this.loadingChangeUserScope = false;
    },
    async loadAsyncForRoute() {
      const users = await getUsers();
      this.users = users;
    },
  },
};
</script>
