export async function refreshClientSessionForSave(session, refresh, now = Date.now()) {
  if (!session?.user?.id || !session.access_token) {
    throw Object.assign(new Error("Please sign in again before saving."), { code: "CLIENT_SESSION_REQUIRED" });
  }
  if (Number(session.expires_at) * 1000 > now + 60000) return session;
  if (!session.refresh_token) {
    throw Object.assign(new Error("Please sign in again before saving."), { code: "CLIENT_SESSION_REQUIRED" });
  }
  const renewed = await refresh(session.refresh_token);
  if (!renewed?.access_token || renewed.user?.id !== session.user.id) {
    throw Object.assign(new Error("The signed-in account changed. Please sign in again."), { code: "CLIENT_SESSION_MISMATCH" });
  }
  return {
    ...session,
    ...renewed,
    refresh_token: renewed.refresh_token || session.refresh_token,
    expires_at: renewed.expires_at || Math.floor(now / 1000) + Number(renewed.expires_in || 0),
  };
}
