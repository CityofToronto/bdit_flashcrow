<template>
  <div class="fc-login mt-m px-xl">
    <h1>Log in</h1>
    <div class="flex-container-row">
      <div class="flex-1">
        <div class="form-group">
          <label>
            <span>Name</span>
            <input
              v-model="$v.name.$model"
              class="font-size-xl full-width mb-m"
              :class="{
                invalid: $v.name.$error,
              }"
              name="name"
              type="text" />
          </label>
          <div
            v-if="$v.name.$error"
            class="tds-panel tds-panel-error">
            <i class="fa fa-times-circle"></i>
            <p>
              Please enter your name.
            </p>
          </div>
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
              name="email"
              type="text" />
          </label>
          <div
            v-if="$v.email.$error"
            class="tds-panel tds-panel-error">
            <i class="fa fa-times-circle"></i>
            <p>
              Please enter a valid
              <strong>@toronto.ca</strong> email address.
            </p>
          </div>
        </div>
        <button
          class="tds-button-primary font-size-2xl"
          :disabled="loading || $v.$invalid"
          @click="onClickLogin">
          Log in
        </button>
      </div>
      <div class="flex-1"></div>
    </div>
  </div>
</template>

<script>
import { email, required } from 'vuelidate/lib/validators';
import { mapActions } from 'vuex';

export default {
  name: 'FcLogin',
  data() {
    return {
      name: '',
      email: '',
      loading: false,
    };
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
      this.authStub({ name: this.name, email: this.email })
        .then(() => {
          this.loading = false;
        });
    },
    ...mapActions(['authStub']),
  },
};
</script>

<style lang="postcss">
.fc-login {

}
</style>
