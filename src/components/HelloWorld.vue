<template>
  <form action="/flashcrow/api/login" method="POST">
    <div class="form-group">
      <label for="username">Username</label>
      <input type="text" id="username" name="username">
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" id="password" name="password">
    </div>
    <div class="form-group">
      <input type="submit" value="Login">
    </div>
  </form>
</template>

<script>
export default {
  name: 'HelloWorld',
};
</script>

<style scoped lang="postcss">
</style>
