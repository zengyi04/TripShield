# Submission assets

Drop the images referenced by the root [README.md](../README.md) here. Filenames must match exactly or the embeds will break.

## `ideation/`

| File | What it shows |
| --- | --- |
| `problem-tree-detailed.png` | Problem tree drilling each cause down to its root cause |

## `architecture/`

| File | What it shows |
| --- | --- |
| `system-architecture.png` | Client, proxy, backend and external services, with built vs planned marked |
| `system-architecture.mmd` | Mermaid source for the diagram above |

After editing the source, re-render with:

```bash
npx @mermaid-js/mermaid-cli -i docs/architecture/system-architecture.mmd -o docs/architecture/system-architecture.png -b white -s 3
```

If you add more boards (mindmaps, crazy eights, 5 Whys, user flows), drop them here and embed them in section 2.2. Messy photos of whiteboards or paper are fine — the reviewers want to see how the team thought, not polished diagrams.

## `screens/`

| File | Screen |
| --- | --- |
| `trip-fix.png` | Trip Fix (Trip Flex) — cropped to phone frame, ~240px wide in README |
| `what-if.png` | What-If Simulator — cropped to phone frame, ~240px wide in README |

Add more captures here when ready and embed them in section 3 with `<img … width="240">` so they stay phone-sized on GitHub.
