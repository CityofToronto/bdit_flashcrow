export default {
  /*
   * For admin users, we override the default TTL with a much shorter duration.  This
   * helps mitigate the risk of leaving an admin session open unattended.
   *
   * See the `onPostAuth` hook in `MoveServer`, and `login` in `AuthController`,
   * for callsites.
   */
  TTL_ADMIN: 5 * 60 * 1000,

  /*
   * Default TTL for user sessions.
   *
   * This is deliberately set to the length of core business hours (8am-5pm) at the City
   * of Toronto.  Sessions started by non-admin users at start-of-day are guaranteed to
   * remain open through end-of-day, and are also guaranteed to expire before
   * start-of-next-day.
   */
  TTL_NON_ADMIN: 9 * 60 * 60 * 1000,
};
