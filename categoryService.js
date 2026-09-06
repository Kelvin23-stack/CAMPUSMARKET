/* =========================================================
   CampusMarket — js/services/categoryService.js
   ========================================================= */

const categoryService = {
  async getCategories() {
    const { data, error } = await sb.from("categories").select("*").order("name");
    if (error) throw error;
    return data;
  },
};
