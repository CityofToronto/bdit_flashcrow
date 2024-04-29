<template>
  <div
    class="fc-dashboard-nav-user text-center pb-2">
    <div class="d-none">
      <form
        v-if="auth.loggedIn"
        ref="formSignOut"
        method="POST"
        action="/api/auth/logout">
        <input type="hidden" name="csrf" :value="auth.csrf" />
      </form>
    </div>
    <Login ref="login" />
    <v-menu
      v-if="auth.loggedIn"
      :attach="$el"
      :min-width="140"
      bottom
      :nudge-top="hasAuthScope(AuthScope.ADMIN) ? '58px' : '10px'"
      :nudge-right="60"
      right
      :z-index="100">
      <template v-slot:activator="{ attrs: attrsMenu, on: onMenu }">
        <FcTooltip right>
          <template v-slot:activator="{ on: onTooltip }">
            <FcButton
              ref="btn"
              :aria-label="username"
              type="fab-icon"
              v-bind="attrsMenu"
              v-on="{ ...onMenu, ...onTooltip }">
              <v-icon>mdi-account-circle</v-icon>
            </FcButton>
          </template>
          <span>{{username}}</span>
        </FcTooltip>
      </template>
      <v-list class="text-left" id="fc_menu_user">
        <v-list-item
          v-if="hasAuthScope(AuthScope.ADMIN)"
          @click="actionAdmin">
          <v-list-item-title>Admin Console</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="actionSignOut">
          <v-list-item-title>Sign out</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <FcTooltip v-else right>
      <template v-slot:activator="{ on }">
        <FcButton
          aria-label="Sign In"
          type="fab-icon"
          @click="$refs.login.actionSignIn()"
          v-on="on">
          <v-icon>mdi-login</v-icon>
        </FcButton>
      </template>
      <span>Sign In</span>
    </FcTooltip>
  </div>
</template>

<script>
import { mapGetters, mapState, mapMutations } from 'vuex';
import Login from '@/web/components/Login.vue';
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import {
  getCollisionFilterState,
  getCommonFilterState,
  getStudyFilterState,
  clearCollisionFilterState,
  clearCommonFilterState,
  clearStudyFilterState,
} from '@/web/store/FilterState';
import TimeFormatters from '@/lib/time/TimeFormatters';
import {
  CollisionDetail,
  CollisionEmphasisArea,
  StudyHours,
  StudyType,
} from '@/lib/Constants';

export default {
  name: 'FcDashboardNavUser',
  mixins: [
    FcMixinAuthScope,
  ],
  components: {
    Login,
    FcButton,
    FcTooltip,
  },
  computed: {
    ...mapState(['auth']),
    ...mapGetters(['username']),
  },
  mounted() {
    const collisionFilters = JSON.parse(getCollisionFilterState());
    const commonFilters = JSON.parse(getCommonFilterState());
    const studyFilters = JSON.parse(getStudyFilterState());

    if (collisionFilters !== null) {
      collisionFilters.details = collisionFilters.details.map(element => CollisionDetail[element]);
      collisionFilters.emphasisAreas = collisionFilters.emphasisAreas
        .map(element => CollisionEmphasisArea[element]);
      this.setFiltersCollision(collisionFilters);
    }

    if (commonFilters !== null) {
      if (commonFilters.dateRangeEnd !== null && commonFilters.dateRangeStart !== null) {
        commonFilters.dateRangeEnd = TimeFormatters
          .convertToLuxonDatetime(commonFilters.dateRangeEnd);
        commonFilters.dateRangeStart = TimeFormatters
          .convertToLuxonDatetime(commonFilters.dateRangeStart);
      }
      this.setFiltersCommon(commonFilters);
    }

    if (studyFilters !== null) {
      studyFilters.hours = studyFilters.hours.map(element => StudyHours[element]);
      studyFilters.studyTypes = studyFilters.studyTypes.map(element => StudyType[element]);
      this.setFiltersStudy(studyFilters);
    }
  },
  methods: {
    actionAdmin() {
      this.$router.push({ name: 'admin' });
    },
    async actionSignOut() {
      const event = this.$analytics.signOutEvent();
      await this.$analytics.send([event]);
      clearCollisionFilterState();
      clearCommonFilterState();
      clearStudyFilterState();
      this.$refs.formSignOut.submit();
    },
    ...mapMutations('viewData', [
      'setFiltersCollision',
      'setFiltersCommon',
      'setFiltersStudy',
    ]),
  },
};
</script>

<style lang="scss">
.fc-dashboard-nav-user {
  position: relative;
}

#fc_menu_user {
  background: white;
}
</style>
