# TheWatchNode – code cleanup

Unzip at the root of the project and replace the existing files.

## Delete these 3 files (they are no longer used)

- `_sass/minimal-mistakes/_variables.scss` – full copy of the theme file for one value; `$x-large: 1800px` now lives in `assets/css/main.scss`
- `_sass/minimal-mistakes/_print.scss` – identical to the theme's own file
- `_sass/cyberpunk-folders.scss` – was never imported

## New files

- `_sass/_nav-fixes.scss` – the rules that were written directly inside `assets/css/main.scss`
- `_includes/boot-screen.html` – the homepage boot screen, moved out of `_layouts/default.html`

## Rolling back

Everything is in git: `git checkout -- .` and restore the 3 deleted files if anything looks wrong.
