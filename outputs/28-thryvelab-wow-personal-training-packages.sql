-- Migration 28: Configure ThryveLab WOW Personal Training package variants.
-- Manual execution only. This is intentionally limited to business_slug = 'thryvelab'.
-- The existing placeholder service id is retained for the 45-minute / 1-session variant.
begin;

insert into public.business_services
  (id, business_slug, name, description, duration_minutes, price, pricing_type, pricing_unit, schedule, service_category, display_order, status)
values
  ('thryvelab-wow-personal-training', 'thryvelab', 'WOW Personal Training - 45 Minutes - 1 Session', 'WOW Personal Training package: 1 session at 45 minutes per appointment.', 45, 1400, 'FIXED', 'FLAT', '{}'::jsonb, 'WOW PERSONAL TRAINING', 60, 'Active'),
  ('thryvelab-wow-personal-training-45-3', 'thryvelab', 'WOW Personal Training - 45 Minutes - 3 Sessions', 'WOW Personal Training package: 3 sessions at 45 minutes per appointment.', 45, 4000, 'FIXED', 'FLAT', '{}'::jsonb, 'WOW PERSONAL TRAINING', 61, 'Active'),
  ('thryvelab-wow-personal-training-45-8', 'thryvelab', 'WOW Personal Training - 45 Minutes - 8 Sessions', 'WOW Personal Training package: 8 sessions at 45 minutes per appointment.', 45, 8400, 'FIXED', 'FLAT', '{}'::jsonb, 'WOW PERSONAL TRAINING', 62, 'Active'),
  ('thryvelab-wow-personal-training-45-12', 'thryvelab', 'WOW Personal Training - 45 Minutes - 12 Sessions', 'WOW Personal Training package: 12 sessions at 45 minutes per appointment.', 45, 12600, 'FIXED', 'FLAT', '{}'::jsonb, 'WOW PERSONAL TRAINING', 63, 'Active'),
  ('thryvelab-wow-personal-training-45-24', 'thryvelab', 'WOW Personal Training - 45 Minutes - 24 Sessions', 'WOW Personal Training package: 24 sessions at 45 minutes per appointment.', 45, 22400, 'FIXED', 'FLAT', '{}'::jsonb, 'WOW PERSONAL TRAINING', 64, 'Active'),
  ('thryvelab-wow-personal-training-60-1', 'thryvelab', 'WOW Personal Training - 60 Minutes - 1 Session', 'WOW Personal Training package: 1 session at 60 minutes per appointment.', 60, 1700, 'FIXED', 'FLAT', '{}'::jsonb, 'WOW PERSONAL TRAINING', 65, 'Active'),
  ('thryvelab-wow-personal-training-60-3', 'thryvelab', 'WOW Personal Training - 60 Minutes - 3 Sessions', 'WOW Personal Training package: 3 sessions at 60 minutes per appointment.', 60, 4800, 'FIXED', 'FLAT', '{}'::jsonb, 'WOW PERSONAL TRAINING', 66, 'Active'),
  ('thryvelab-wow-personal-training-60-8', 'thryvelab', 'WOW Personal Training - 60 Minutes - 8 Sessions', 'WOW Personal Training package: 8 sessions at 60 minutes per appointment.', 60, 11200, 'FIXED', 'FLAT', '{}'::jsonb, 'WOW PERSONAL TRAINING', 67, 'Active'),
  ('thryvelab-wow-personal-training-60-12', 'thryvelab', 'WOW Personal Training - 60 Minutes - 12 Sessions', 'WOW Personal Training package: 12 sessions at 60 minutes per appointment.', 60, 16000, 'FIXED', 'FLAT', '{}'::jsonb, 'WOW PERSONAL TRAINING', 68, 'Active'),
  ('thryvelab-wow-personal-training-60-24', 'thryvelab', 'WOW Personal Training - 60 Minutes - 24 Sessions', 'WOW Personal Training package: 24 sessions at 60 minutes per appointment.', 60, 25800, 'FIXED', 'FLAT', '{}'::jsonb, 'WOW PERSONAL TRAINING', 69, 'Active')
on conflict (id) do update set
  business_slug = excluded.business_slug,
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  pricing_type = excluded.pricing_type,
  pricing_unit = excluded.pricing_unit,
  schedule = excluded.schedule,
  service_category = excluded.service_category,
  display_order = excluded.display_order,
  status = excluded.status;

commit;
