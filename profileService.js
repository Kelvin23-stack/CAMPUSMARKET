/* =========================================================
   CampusMarket — js/services/profileService.js
   ========================================================= */

const profileService = {
  async getProfile(userId) {
    const { data, error } = await sb
      .from("profiles")
      .select("*, universities(name)")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  },

  /** patch = { full_name, username, bio, phone, avatar_url, university_id, role } */
  async updateProfile(userId, patch) {
    const { data, error } = await sb
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
