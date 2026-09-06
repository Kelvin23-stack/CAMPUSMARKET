/* =========================================================
   CampusMarket — js/services/listingService.js
   ========================================================= */

const listingService = {
  /**
   * filters = { category, universityId, condition, maxPrice, query, sort }
   * Mirrors the filter shape already used by js/marketplace.js's `state`
   * object, so wiring this in later is a straight swap.
   */
  async getListings(filters = {}) {
    let q = sb
      .from("listings")
      .select("*, listing_images(image_url, display_order), profiles(full_name, avatar_url)")
      .eq("status", "active");

    if (filters.category && filters.category !== "all") q = q.eq("category_id", filters.category);
    if (filters.universityId && filters.universityId !== "all") q = q.eq("university_id", filters.universityId);
    if (filters.condition && filters.condition !== "all") q = q.eq("condition", filters.condition);
    if (filters.maxPrice) q = q.lte("price", Number(filters.maxPrice));
    if (filters.query) q = q.ilike("title", `%${filters.query}%`);

    if (filters.sort === "low") q = q.order("price", { ascending: true });
    else if (filters.sort === "high") q = q.order("price", { ascending: false });
    else q = q.order("created_at", { ascending: false });

    const { data, error } = await q;
    if (error) throw error;
    return data;
  },

  async getListing(id) {
    const { data, error } = await sb
      .from("listings")
      .select("*, listing_images(image_url, display_order), profiles(full_name, avatar_url, created_at)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  /** listing = { title, description, price, category_id, condition, location, university_id } */
  async createListing(sellerId, listing) {
    const { data, error } = await sb
      .from("listings")
      .insert({ ...listing, seller_id: sellerId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateListing(id, patch) {
    const { data, error } = await sb.from("listings").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteListing(id) {
    const { error } = await sb.from("listings").delete().eq("id", id);
    if (error) throw error;
  },

  async getListingsBySeller(sellerId) {
    const { data, error } = await sb
      .from("listings")
      .select("*, listing_images(image_url, display_order)")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
};
