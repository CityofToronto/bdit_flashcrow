<template>
  <FcDialogConfirm
    v-model="internalValue"
    textOk="Request Access"
    title="Access Unauthorized"
    @action-ok="actionRequestAccess">
    <div class="body-1">
      <p>
        This feature requires additional permissions to access.
      </p>
      <div
        v-for="{ authScope, granted } in scopeDetails"
        :key="authScope.name"
        :class="granted ? 'success--text' : 'error--text'">
        <v-icon
          :color="granted ? 'success' : 'error'"
          left>
          {{granted ? 'mdi-check-circle' : 'mdi-close-octagon'}}
        </v-icon>
        <span>{{authScope.description}}</span>
      </div>
    </div>
  </FcDialogConfirm>
</template>

<script>
import { mapGetters } from 'vuex';

import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogConfirmUnauthorized',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcDialogConfirm,
  },
  props: {
    scope: Array,
  },
  computed: {
    scopeDetails() {
      const { scope, userScope } = this;
      return scope.map((authScope) => {
        const granted = userScope.includes(authScope);
        return {
          authScope,
          granted,
        };
      });
    },
    ...mapGetters(['username', 'userScope']),
  },
  methods: {
    actionRequestAccess() {
      const { scopeDetails, username } = this;
      const authScopesMissing = scopeDetails
        .filter(({ granted }) => !granted)
        .map(({ authScope }) => authScope.name)
        .join(', ');
      const subject = `Requesting access for ${username}: ${authScopesMissing}`;
      const subjectEncoded = window.encodeURIComponent(subject);
      const url = `mailto:move-team@toronto.ca?subject=${subjectEncoded}`;
      window.open(url, '_blank');
    },
  },
};
</script>
