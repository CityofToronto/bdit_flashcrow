<template>
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
      <input type="submit" value="Login">
    </div>
  </form>
</template>

<script>
export default {
  name: 'login',
};
</script>

<style scoped lang="postcss">
</style>
