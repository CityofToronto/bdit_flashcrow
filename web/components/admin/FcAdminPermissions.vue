<template>
  <section class="fc-requests-track d-flex flex-column fill-height">
    <div class="align-center d-flex mt-1 mb-0 px-5">
      <h2 class="display-3 mt-0 flex-grow-2" id="heading_track_requests_requests">
        User Permissions
      </h2>
      <v-spacer></v-spacer>
      <v-card flat outlined class="flex-grow-0 flex-shrink-0">
        <v-text-field
          v-model="query"
          append-icon="mdi-magnify"
          class="fc-search-bar-requests flex-grow-0 flex-shrink-0"
          dense
          hide-details
          label="Search"
          outlined>
        </v-text-field>
      </v-card>
    </div>
    <section class="flex-grow-1 flex-shrink-1 mt-3 mb-6 px-5">
      <v-card class="fc-requests-track-card d-flex flex-column fill-height" flat outlined>
        <v-card-text class="flex-grow-1 pa-0">
          <FcDataTable
            class="fc-data-table-users"
            :columns="columns"
            :page.sync="page"
            :items="users"
            :items-per-page.sync="itemsPerPage"
            fixed-header
            height="calc(100vh - 250px)"
            :loading="loading"
            must-sort
            sort-by="UNIQUE_NAME"
            :sort-desc="false"
            :sort-keys="sortKeys">
            <template v-slot:[`item.UNIQUE_NAME`]="{ item }">
              <span>{{ item | username }}</span>
            </template>
            <template
              v-for="{ authScope, itemSlot } of authScopeSlots"
              v-slot:[itemSlot]="{ item }">
              <div :key="'u:' + item.id + ':' + authScope.name" class="d-flex">
                <FcTooltip right>
                  <template v-slot:activator="{ on }">
                    <div v-if="authScope.name === 'MVCR_READ'">
                      <FcAdminDropdown
                        :permissions="mvcrPermissionSlots"
                        :currentSelection="getMvcrState(item)"
                        :currentUser="item"
                        @change="mvcrPermissionChanged" />
                    </div>
                    <div v-else>
                      <v-checkbox
                        v-model="item.scope"
                        class="mt-0 pt-0"
                        :disabled="loadingChangeUserScope"
                        hide-details
                        :value="authScope"
                        @change="actionChangeUserScope(item)"
                        v-on="on">
                      </v-checkbox>
                    </div>
                  </template>
                  <span>
                    <span v-if="item.scope.includes(authScope)">
                      Deny {{ authScope.name }}
                    </span>
                    <span v-else>
                      Grant {{ authScope.name }}
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

          <FcProgressCircular v-if="isLoadingTotal" small />
          <div v-else>
            {{ pageFrom }}&ndash;{{ pageTo }} of {{ total }}
          </div>

          <v-pagination v-model="page" :length="numPages" :total-visible="7" />
        </v-card-actions>
      </v-card>
    </section>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import { AuthScope, MvcrPermissions } from '@/lib/Constants';
import { debounce } from '@/lib/FunctionUtils';
import { formatUsername } from '@/lib/StringFormatters';
import FcProgressCircular from '@/web/components/dialogs/FcProgressCircular.vue';
import { getUsersPagination, getUsersTotal, putUser } from '@/lib/api/WebApi';
import FcDataTable from '@/web/components/FcDataTable.vue';
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';
import FcAdminDropdown from './FcAdminDropdown.vue';

export default {
  name: 'FcAdminPermissions',
  mixins: [
    FcMixinRouteAsync,
  ],
  components: {
    FcDataTable,
    FcTooltip,
    FcProgressCircular,
    FcAdminDropdown,
  },
  data() {
    const selectedPermission = '';
    const authScopeSlots = AuthScope.enumValues.map((authScope) => {
      const { name } = authScope;
      const itemSlot = `item.${name}`;
      return { authScope, itemSlot };
    });
    const mvcrPermissionSlots = MvcrPermissions.enumValues.map((permissionState) => {
      const { label } = permissionState;
      const permissionSlot = `item.${label}`;
      return { permissionState, permissionSlot };
    });
    const columns = [
      {
        value: 'UNIQUE_NAME',
        text: 'User',
      },
      ...AuthScope.enumValues.map(({ name, description }) => ({
        value: name,
        text: description,
      })),
    ];
    const sortKeys = {
      UNIQUE_NAME: formatUsername,
    };
    return {
      authScopeSlots,
      selectedPermission,
      mvcrPermissionSlots,
      columns,
      loadingChangeUserScope: false,
      loading: true,
      sortKeys,
      users: [],
      page: 1,
      total: 0,
      itemsPerPage: 50,
      query: '',
      isLoadingTotal: true,
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
      }, 200),
      immediate: true,
    },
  },
  methods: {
    async actionChangeUserScope(user) {
      this.loadingChangeUserScope = true;
      await putUser(this.auth, user);
      this.loadingChangeUserScope = false;
    },
    async updateData(filterParams) {
      this.loading = true;
      this.isLoadingTotal = true;
      const { limit, offset, search } = filterParams;
      const users = await getUsersPagination(limit, offset, search);
      const total = await getUsersTotal(search);

      this.users = users;
      this.total = total;
      this.loading = false;
      this.isLoadingTotal = false;
    },
    async loadAsyncForRoute() {
      this.updateData(this.filterParams);
    },
    getMvcrState(user) {
      return MvcrPermissions[user.mvcrAcctType];
    },
    mvcrPermissionChanged(mvcrAcctType) {
      this.actionChangeUserScope(mvcrAcctType);
    },
  },
};
</script>
