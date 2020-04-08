import { mapState } from 'vuex';

import { AuthScope } from '@/lib/Constants';
import { hasAuthScope } from '@/lib/auth/ScopeMatcher';

/**
 * Vue mixin that allows you to include dynamic auth scope checks in your templates.
 *
 * @name FcMixinAuthScope
 * @example
 * <template>
 *   <FcButton type="primary">
 *     <v-icon left>mdi-binoculars</v-icon>
 *     Watch Safely from Afar
 *   </FcButton>
 *   <FcButton
 *     v-if="hasAuthScope(AuthScope.ADMIN)"
 *     color="error"
 *     type="secondary">
 *     <v-icon left>mdi-rocket</v-icon>
 *     Launch!
 *   </FcButton>
 * </template>
 *
 * <script>
 * import FcButton from '@/web/components/inputs/FcButton.vue';
 * import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
 *
 * export default {
 *   name: 'FcControlRocket',
 *   mixins: [
 *     FcMixinAuthScope,
 *   ],
 *   components: {
 *     FcButton,
 *   },
 * };
 * </script>
 */
export default {
  data() {
    return {
      AuthScope,
    };
  },
  computed: {
    ...mapState(['auth']),
  },
  methods: {
    hasAuthScope(authScope) {
      const { user } = this.auth;
      return hasAuthScope(user, authScope);
    },
  },
};
