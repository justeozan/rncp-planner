# RNCP planner

Fork of [lucas-ht/42calculator](https://github.com/lucas-ht/42calculator)
(GPL-3.0, [42calculator.fr](https://42calculator.fr)) with an RNCP **path
optimizer** added on top.

The 42calculator site itself is unchanged: sign in with 42, the XP calculator,
the RNCP progress page. What this fork adds:

* **`/planner`**: for each of the 15 combinations of the four titles
  (`rncp6-1`, `rncp6-2`, `rncp7-1`, `rncp7-2`), the shortest list of projects
  that satisfies every condition, either by fewest projects or by shortest time.
  The page is public (no 42 account needed). The model and the solver are
  described in [`optimizer/README.md`](optimizer/README.md).
* **Up-to-date project list**: `data/projects_21.json` includes the 22 projects
  missing since September 2026
  ([42calculator#70](https://github.com/lucas-ht/42calculator/issues/70), data
  from the still-open [PR #69](https://github.com/lucas-ht/42calculator/pull/69),
  a snapshot of the intra from early September 2026). In that snapshot 17 of
  them have an XP of 0, the 5 others have XP but 0 validations, and none is in
  an RNCP pool yet, so they show up in the calculator's project list but change
  nothing in the RNCP requirements or in the planner output. To refresh the
  data from the intra, run `scripts/fetch_projects.py` with your own 42 API
  key ([scripts/README.md](scripts/README.md)).
* **`data/rules.json`**: hand-curated prerequisite chains, common core and
  excluded entries. Read by the optimizer only; the site ignores it.


## Running locally

Same as upstream: see [docs/running.md](docs/running.md) (Docker, plus a 42 API
key for "Sign in with 42").

```bash
docker compose up --build        # http://localhost:3000, planner at /planner
```

`npm run dev` also works once `.env` is filled in (copy `.env.example`) and a
Redis HTTP endpoint is reachable at `KV_REST_API_URL`.


## Regenerating the planner

`public/planner.html` is generated for a given starting XP and list of projects
already done. Python 3, no dependency.

```bash
cd optimizer
python3 build.py --xp 167758 --done 1396,1405    # writes ../public/planner.html
python3 test_planner.py                          # checks that plans are valid
```


## License

GPL-3.0, same as upstream. See [LICENSE.md](LICENSE.md).
