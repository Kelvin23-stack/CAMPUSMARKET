/* =========================================================
   CampusMarket — js/services/universityService.js
   Not in the original service list, but login.html's campus
   picker needs a source for real universities, so it gets its
   own tiny service rather than an inline query.
   ========================================================= */

const universityService = {
  async getUniversities() {
    const { data, error } = await sb.from("universities").select("*").order("name");
    if (error) throw error;
    return data;
  },
};
