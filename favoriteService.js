/* =========================================================
   CampusMarket — js/services/favoriteService.js
   ========================================================= */

const favoriteService = {
  async getFavorites(userId) {
    const { data, error } = await sb
      .from("favorites")
      .select("listing_id, listings(*, listing_images(image_url, display_order))")
      .eq("user_id", userId);
    if (error) throw error;
    return data;
  },

  async addFavorite(userId, listingId) {
    const { error } = await sb.from("favorites").insert({ user_id: userId, listing_id: listingId });
    if (error) throw error;
  },

  async removeFavorite(userId, listingId) {
    const { error } = await sb
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("listing_id", listingId);
    if (error) throw error;
  },

  async isFavorite(userId, listingId) {
    const { data, error } = await sb
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("listing_id", listingId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },
};
