# Fulusy versioning

## Policy (both)

1. **Git tag** `v1.0.0` — immutable release marker on the commit that freezes v1.0.
2. **Folder** `v1.0/` — snapshot of the v1.0 app tree (side-by-side with future `v1.1/`, …).

## Branches

| Branch | Role |
|--------|------|
| `main` | Active development |
| `release/1.0` | Frozen line for v1.0 fixes only |
| `develop` (optional) | Integration before release |

## How a new version is cut

```bash
# After v1.0 is complete on main:
git checkout main
git pull
git tag -a v1.0.0 -m "Fulusy v1.0.0"
git push origin v1.0.0

# Optional GitHub Release from the tag in the UI
```

Next major/minor drop:

- Create `v1.1/` (copy or new work)
- Tag `v1.1.0` when ready
- Keep `v1.0/` untouched unless backporting

## App location for v1.0

Until the full tree is mirrored under `v1.0/`, the **working app lives at the repo root** (`src/`, `supabase/`, …).  
`v1.0/README.md` documents the snapshot; remaining modules continue to land on `main` then get copied into `v1.0/` for the freeze.
