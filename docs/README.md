# Submission assets

Drop the images referenced by the root [README.md](../README.md) here. Filenames must match exactly or the embeds will break.

## `ideation/`

| File | What it shows |
| --- | --- |
| `problem-tree-detailed.png` | Problem tree drilling each cause down to its root cause |

The board is generated from the `.mmd` source next to it. After editing the source, re-render with:

```bash
npx @mermaid-js/mermaid-cli -i docs/ideation/<name>.mmd -o docs/ideation/<name>.png -b white -s 4
```

If you add more boards (mindmaps, crazy eights, 5 Whys, user flows), drop them here and embed them in section 2.2. Messy photos of whiteboards or paper are fine — the reviewers want to see how the team thought, not polished diagrams.

## `screens/`

| File | Screen |
| --- | --- |
| `home.png` | Home with the four feature cards |
| `buy-window.png` | Buy Window with price risk meter and countdown |
| `consensus-swipe.png` | Travel DNA questionnaire |
| `consensus-result.png` | Vote tallies and locked schedule |
| `ledger.png` | Receipt split by line item |
| `ledger-rebalance.png` | Recalculated daily targets after an overspend |
| `trip-fix.png` | Trip Health Score and repaired plan |
| `what-if.png` | What-If Simulator |

Capture these from `npm start` (Expo Go) rather than the web preview, since the native screens are the ones being judged.
