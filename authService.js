/* =========================================================
   CampusMarket — js/services/authService.js
   All Supabase Auth calls live here. Pages/other services should
   go through this module rather than calling `sb.auth.*` directly.
   ========================================================= */

const authService = {
  /**
   * Create a new account. `meta` can include full_name, role ("buy"/"sell"),
   * and university_id — these land in auth user_metadata, and the
   * on_auth_user_created trigger copies full_name/role into profiles.
   */
  async signUp(email, password, meta = {}) {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: meta },
    });
    if (error) throw error;

    // If a university was chosen at sign-up, and email confirmation is off
    // (so we already have a session), attach it to the new profile row.
    if (meta.university_id && data.user) {
      await sb.from("profiles")
        .update({ university_id: meta.university_id })
        .eq("id", data.user.id);
    }
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await sb.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await sb.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getCurrentUser() {
    const { data, error } = await sb.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /** Fires `callback(session)` on sign-in, sign-out, and token refresh. */
  onAuthStateChange(callback) {
    return sb.auth.onAuthStateChange((_event, session) => callback(session));
  },
};
