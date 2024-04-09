<template>
  <section class="fc-requests-track d-flex flex-column fill-height">
    <div class="align-center d-flex mt-2 mb-2 px-5">
      <h2 class="display-3 mt-0" id="heading_track_requests_requests">
        User Permissions
      </h2>
      <v-spacer></v-spacer>
      <v-card flat outlined class="flex-grow-1 flex-shrink-1">
        <v-text-field
          v-model="query"
          append-icon="mdi-magnify"
          class="fc-search-bar-requests flex-grow-0 flex-shrink-0"
          dense
          hide-details
          label="Search for a user"
          outlined>
        </v-text-field>
      </v-card>
      <!-- <v-spacer></v-spacer> -->
    </div>
    <!-- <div class="flex-grow-0 flex-shrink-0 px-5">

    </div> -->
    <section class="flex-grow-1 flex-shrink-1 mt-4 mb-6 px-5">
      <v-card class= "fc-requests-track-card d-flex flex-column fill-height" flat outlined>
        <!-- <v-divider></v-divider> -->

        <v-card-text class="flex-grow-1 pa-0">
          <FcDataTable
            class="fc-data-table-users"
            :columns="columns"
            :page.sync="page"
            :items="users"
            :items-per-page.sync="itemsPerPage"
            fixed-header
            height="calc(100vh - 265px)"
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
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="flex-grow-0 flex-shrink-0">
          <v-spacer></v-spacer>

          <div>
            {{pageFrom}}&ndash;{{pageTo}} of {{total}}
          </div>

          <v-pagination v-model="page" :length="numPages" :total-visible="7"/>
        </v-card-actions>
      </v-card>
    </section>
  </section>
</template>

<script>
import { mapState } from 'vuex';

import { AuthScope } from '@/lib/Constants';
import { debounce } from '@/lib/FunctionUtils';
import { formatUsername } from '@/lib/StringFormatters';
import { getUsersPagination, getUsersTotal, putUser } from '@/lib/api/WebApi';
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
      loading: true,
      sortKeys,
      users: [],
      page: 1,
      total: 0,
      itemsPerPage: 50,
      query: '',
    };
  },
  computed: {
    ...mapState(['auth']),
    numPages() {
      return Math.ceil(this.total / this.itemsPerPage);
    },
    pageFrom() {
      if (this.total === 0) {
        return 0;
      }
      return (this.page - 1) * this.itemsPerPage + 1;
    },
    pageTo() {
      return Math.min(this.total, this.page * this.itemsPerPage);
    },
    filterParams() {
      const limit = this.itemsPerPage;
      const offset = this.itemsPerPage * (this.page - 1);
      const search = this.query;
      return {
        limit, offset, search,
      };
    },
  },
  watch: {
    query: {
      handler: function resetPage() {
        this.page = 1;
      },
      immediate: true,
    },
    filterParams: {
      deep: true,
      handler: debounce(async function updateItems() {
        this.updateData(this.filterParams);
      }),
      immediate: true,
    },
  },
  methods: {
    async actionChangeUserScope(user) {
      this.loadingChangeUserScope = true;
      await putUser(this.auth.csrf, user);
      this.loadingChangeUserScope = false;
    },
    async updateData(filterParams) {
      this.loading = true;
      const { limit, offset, search } = filterParams;
      const users = await getUsersPagination(limit, offset, search);
      const total = await getUsersTotal(search);

      this.users = users;
      this.total = total;
      this.loading = false;
    },
    async loadAsyncForRoute() {
      this.updateUsers(this.filterParams);
    },
  },
};
</script>
