<template>
  <div class="fc-login mt-m px-l">
    <div class="hide">
      <form
        ref="form"
        id="form_fc_login"
        method="POST"
        action="/api/auth/stub">
        <input type="hidden" name="csrf" :value="auth.csrf" />
      </form>
    </div>
    <h1>Log in to MOVE</h1>
    <div class="flex-container-row">
      <div class="flex-1 px-l">
        <div class="form-group">
          <label>
            <span>Name</span>
            <input
              v-model="$v.name.$model"
              class="font-size-xl full-width mb-m"
              :class="{
                invalid: $v.name.$error,
              }"
              form="form_fc_login"
              name="name"
              tabindex="1"
              type="text" />
          </label>
          <TdsPanel
            v-if="$v.name.$error"
            variant="error">
            <p>
              Please enter your name.
            </p>
          </TdsPanel>
        </div>
        <div class="form-group">
          <label>
            <span>Email</span>
            <input
              v-model="$v.email.$model"
              class="font-size-xl full-width mb-m"
              :class="{
                invalid: $v.email.$error,
              }"
              form="form_fc_login"
              name="email"
              tabindex="2"
              type="text" />
          </label>
          <TdsPanel
            v-if="$v.email.$error"
            variant="error">
            <p>
              Please enter a valid
              <strong>@toronto.ca</strong> email address.
            </p>
          </TdsPanel>
        </div>
        <button
          class="tds-button-primary font-size-2xl"
          :disabled="loading || $v.$invalid"
          form="form_fc_login"
          tabindex="3"
          type="submit"
          @click="onClickLogin">
          Log in
        </button>
      </div>
      <div class="flex-1 px-l">
        <TdsPanel
          class="font-size-l"
          variant="info">
          <p>
            This is a test login page.  To log in, enter
            your name and <strong>@toronto.ca</strong> email address.  If this is
            your first time using MOVE, we'll automatically create your account.
          </p>
          <p>
            Please use your actual name and email address!  That helps us transition to an
            actual login mechanism later.
          </p>
        </TdsPanel>
      </div>
    </div>
  </div>
</template>

<script>
import { email, required } from 'vuelidate/lib/validators';
import { mapState } from 'vuex';

import TdsPanel from '@/components/tds/TdsPanel.vue';

export default {
  name: 'FcLogin',
  components: {
    TdsPanel,
  },
  data() {
    return {
      name: '',
      email: '',
      loading: false,
    };
  },
  computed: {
    ...mapState(['auth']),
  },
  validations: {
    email: {
      required,
      email,
      torontoInternal(value) {
        return value.endsWith('@toronto.ca');
      },
    },
    name: {
      required,
    },
  },
  methods: {
    onClickLogin() {
      this.loading = true;
      this.$refs.form.submit();
    },
  },
};
</script>

<style lang="postcss">
.fc-login {

}
</style>
