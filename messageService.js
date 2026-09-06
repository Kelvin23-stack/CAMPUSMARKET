/* =========================================================
   CampusMarket — js/services/messageService.js
   ========================================================= */

const messageService = {
  async getOrCreateConversation(listingId, buyerId, sellerId) {
    const { data: existing, error: findErr } = await sb
      .from("conversations")
      .select("*")
      .eq("listing_id", listingId)
      .eq("buyer_id", buyerId)
      .eq("seller_id", sellerId)
      .maybeSingle();
    if (findErr) throw findErr;
    if (existing) return existing;

    const { data, error } = await sb
      .from("conversations")
      .insert({ listing_id: listingId, buyer_id: buyerId, seller_id: sellerId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getConversations(userId) {
    const { data, error } = await sb
      .from("conversations")
      .select("*, listings(title), buyer:buyer_id(full_name, avatar_url), seller:seller_id(full_name, avatar_url)")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getMessages(conversationId) {
    const { data, error } = await sb
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data;
  },

  async sendMessage(conversationId, senderId, content) {
    const { data, error } = await sb
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: senderId, content })
      .select()
      .single();
    if (error) throw error;

    await sb.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
    return data;
  },

  /** Realtime subscription — call the returned function to unsubscribe. */
  subscribeToMessages(conversationId, onInsert) {
    const channel = sb
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => onInsert(payload.new)
      )
      .subscribe();
    return () => sb.removeChannel(channel);
  },
};
