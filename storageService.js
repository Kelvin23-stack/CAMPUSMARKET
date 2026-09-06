/* =========================================================
   CampusMarket — js/services/storageService.js
   Uploads go to listing-images/<user_id>/<timestamp>-<filename>
   so the storage RLS policies (folder-name-must-match-uid) hold.
   ========================================================= */

const storageService = {
  async uploadListingImage(userId, file) {
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await sb.storage.from("listing-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;

    const { data } = sb.storage.from("listing-images").getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  },

  async deleteListingImage(path) {
    const { error } = await sb.storage.from("listing-images").remove([path]);
    if (error) throw error;
  },
};
