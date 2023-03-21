(.repository?.url? // ""
) as $repo|($repo|test("^git@github\\.com:")) as $isgithub|{
  name: .name,
  description: .description?,
  source: (if $repo=="" then "npm" elif $isgithub then "github" else "git" end),
  location: (if $repo=="" then .name else ($repo|if $isgithub then sub("^git@github\\.com:";"") elif test("^https?://") then . else sub(":";"/")|sub("^git@";"https://") end) end),
  configuration: null,
  deploy_private_key: null
}
