# Netform — website concept

One-page site for the NX-24 edge switch with a scroll-driven 3D exploded view, built with [Three.js](https://threejs.org) and [GSAP ScrollTrigger](https://gsap.com/scrolltrigger/).

Plain HTML, CSS and ES modules. No build step: libraries load from jsDelivr through the import map in `index.html`.

## Structure

```
index.html            page markup + import map
css/
  base.css            design tokens, type, buttons, header
  sections.css        hero, about, numbers, products, team, contact, footer
  stage.css           pinned 3D section, chapter text, part labels
js/
  main.js             entry: wires everything together, render loop
  timeline.js         the 9 scroll chapters (model moves + text swaps)
  callouts.js         keeps part labels pinned to the 3D model
  form.js             contact form (add your endpoint in send())
  three/
    stage.js          renderer, camera, lights, layout fitting
    switch.js         the NX-24 built from separate animatable parts
    rack.js           19″ server rack + patch cables for the install chapter
    helpers.js        small mesh helpers
```

## Run locally

ES modules don't load from `file://`, so serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository (files at the repo root).
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site goes live at `https://<user>.github.io/<repo>/`.

All paths are relative, so it works from a repository subfolder URL. `.nojekyll` tells Pages to serve the files as they are.

## Editing

- **Chapter text:** the `<article class="ch">` blocks in `index.html`. Each one pairs with a `chapter(...)` call in `js/timeline.js`, in the same order.
- **Scroll length:** `end` in `js/main.js` (pixels of scrolling for the whole story).
- **Model size:** the `.78` factor in `js/three/stage.js` (lower = bigger).
- **Brand colors and fonts:** tokens at the top of `css/base.css`. Hanken Grotesk stands in for ABC Monument Grotesk; swap `--f-display` if you have a license.

## Credits

All placeholder content (Netform, NX-24 specs, figures, team) is for the concept and should be replaced with the client's.
