SHELL=bash

publish:
	curl -sS -H "Authorization: Bearer $$packs_token" "$${packs_url:-http://packs.sctest.arch.ruform.ru/}api/action/update_ext" -XPOST -H 'Content-Type: application/json' --data @<(jq -cf ext.jq package.json)
