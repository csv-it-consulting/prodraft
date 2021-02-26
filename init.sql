do
$do$
	begin
		if not exists(select from pg_tables where schemaname = 'public' and tablename = 'games') then
			create table public.games
			(
				id    char(10) primary key,
				state json not null
			);
		end if;
	end
$do$;
