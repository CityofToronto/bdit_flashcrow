<template>
  <div class="login">
    <h1>Sign In</h1>
    <form action="/flashcrow/api/login" method="POST">
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" required placeholder="Username">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required placeholder="Password">
      </div>
      <div class="form-group">
        <input type="submit" value="Sign In">
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Login',
};
</script>

<style scoped lang="postcss">
</style>
