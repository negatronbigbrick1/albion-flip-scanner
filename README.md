# Albion Flip Scanner (mobile web app)

A mobile-first market snapshot scanner using the Albion Online Data Project API. It is a static website/PWA and requires no Java installation on a phone.

## Use locally

For testing, open `index.html` in a modern browser. Fetch requests may work better served over HTTP rather than directly from file://.

## Host it free

1. Create a GitHub account and a new repository.
2. Upload all files in this folder to the repository root.
3. Open repository Settings -> Pages.
4. Set deployment source to Deploy from a branch, select `main` and `/ (root)`, then Save.
5. After publishing, open the Pages URL on your phone. Chrome menu -> Add to Home screen / Install app.

## API

Requests go to the Albion Online Data Project price API on the selected server subdomain. The app compares the lowest reported sell listing (buy-side acquisition estimate) against the highest reported buy order (sell-side exit estimate), across different cities, deducting a configurable selling fee estimate.

## Important limitations

- API data depends on player uploads and may be stale, missing, or limited; timestamp checks are shown where supplied.
- The scanner doesn't validate market depth, volume, item quality beyond quality 1, order fees, travel risk, or competition.
- Fee percentage is an estimate; set it to match your circumstances. Premium and setup fees may affect results.
- It is an unofficial community tool, not affiliated with Sandbox Interactive.
