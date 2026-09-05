begin;

do $$
begin
  update public.businesses
  set messenger_link = 'https://www.facebook.com/PhisavongWorldTravel'
  where slug = 'phisavong-world-travel-and-tours';

  if not found then
    raise exception 'Phisavong World Travel and Tours business record was not found.';
  end if;
end;
$$;

commit;
