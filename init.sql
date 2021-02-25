do
$do$
	begin
		if not exists(select from pg_tables where schemaname = 'public' and tablename = 'games') then
			create table public.games
			(
				id    serial,
				uuid  uuid not null,
				state json not null
			);

			create index uuid_UNIQUE on public.games (uuid);
		end if;
	end
$do$;
