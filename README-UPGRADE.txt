# Albion Flip Scanner — Upgrade Package

This package upgrades the EXISTING `negatronbigbrick1/albion-flip-scanner` GitHub Pages project. It does not require a new repository or a new website address.

## Files to replace at the repository root

- `index.html`
- `app.js`
- `style.css`
- `sw.js`
- `manifest.json`

Keep your existing `icon.svg`.

## Android upload steps

1. Open https://github.com/negatronbigbrick1/albion-flip-scanner
2. Open the repository's `main` branch.
3. Tap **Add file** → **Upload files**.
4. Extract this ZIP on your phone first.
5. Upload the five files listed above from the extracted folder (not the containing ZIP).
6. Scroll down, enter a commit message such as `Upgrade market scanner`.
7. Commit the changes to `main`.
8. Wait a short time, then refresh https://negatronbigbrick1.github.io/albion-flip-scanner/

If GitHub shows a conflict or asks whether to replace an existing file, verify that the path is the repository root before confirming.

## Scanner features

- Asia (East) is the default server; West and Europe are also selectable.
- City-to-city comparison.
- Selected cities → Black Market scanning.
- Custom selected buy cities → one sell city.
- Built-in item categories: starter watchlist, resources, bags/capes, weapons, armor, mounts, food/potions, and combined categories.
- Tier, enchantment, and item-quality selection.
- Minimum net profit, ROI, and maximum data-age filters.
- Start/Stop scanning and optional automatic refresh.
- Batched multi-item API requests.
- Net profit and ROI sorting.
- Item icons, freshness timestamps, summary statistics, and CSV export.
- Responsive mobile and desktop layout.

## Important market-data limitation

The public Albion Online Data Project price snapshot endpoint provides reported minimum sell prices, maximum buy prices, and timestamps. It does not reliably provide live order quantities or full order-book depth. Therefore this version does not pretend to calculate stock or order volume. Verify order quantities, current prices, quality, travel costs, and fees in-game before trading.

This is a browser companion only. It does not read game memory, automate gameplay, or place market orders.


LATEST ADJUSTMENTS
- Item quality now includes All qualities (Normal through Masterpiece).
- Added Refinement, Crafting, and Breeding categories.
- The All qualities option requests quality levels 1 to 5 and shows the quality for each result.
- Some item IDs in the Breeding category may not have recent public price data; missing prices are skipped.
- Large categories can exceed the 250-item scan limit. Reduce selected tiers or enchantments if prompted.
