-- Migration 23: restore the minimum RPC permission required by the
-- authenticated client dashboard. The function itself remains SECURITY DEFINER
-- and enforces ThryveLab ownership and business-user authorization.

grant execute on function public.get_thryvelab_meeting_email_status(text)
to authenticated;
