do
$do$
	begin
		create schema if not exists prodraft;

		if not exists(select from pg_tables where schemaname = 'prodraft' and tablename = 'games') then
			create table prodraft.games
			(
				id    serial,
				uuid  uuid not null,
				state json not null
			);

			create index uuid_UNIQUE on prodraft.games (uuid);
		end if;
	end
$do$;
