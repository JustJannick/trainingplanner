# justTrain

A personal gym training app: plan workouts per gym, schedule them on a week board, log sets with a rest timer, track progress, and look up how to do 876 exercises. Installable on Android and laptops (it's a Progressive Web App) and works offline. Data syncs between devices through Firebase.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app: layout, styles and code |
| `config.js` | Firebase project settings (public identifiers, not secrets) |
| `fb.js` | Firebase JS SDK v13 (app, auth, firestore) bundled into one file, exposed as `window.FB` (Apache-2.0) |
| `sw.js` | Service worker: offline cache and update prompt |
| `manifest.webmanifest`, `icons/` | What makes it installable as an app (icons made from the owner's picture) |
| `img/bg.webp` | The same picture, shown faded behind the app |
| `lib/ex.json` | Exercise library index: names, muscles, equipment, instructions |
| `lib/c/<n>.json` | Exercise pictures: looping 2-frame WebP animations, base64, 5 exercises per file (exercise `NNNN` is in file `floor(NNNN/5)`) |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |

Exercise data, photos and instructions come from [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (public domain).

## Data model (Cloud Firestore)

Everything lives under `users/{uid}/`, and the security rules only let a signed-in user read or write their own folder:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

- `cfg/main`: folders (one per gym, with a plate colour) and the weight unit
- `cfg/active`: the workout in progress, if any
- `cfg/videos`: your own YouTube videos, `list` of `{k, name, url}` where `k` is the exercise name in lower case, or `lib:<library id>` for one saved from the Exercises tab
- `workouts/{id}`: workout templates (`ex` = exercises, each with `sets`, `rest`, `ss` = superset with next, `lib` = linked library exercise id)
- `plan/{YYYY-MM-DD}`: workouts scheduled on a day
- `sessions/{id}`: logged workouts with the sets that were done

## Releasing a change

1. Edit the files.
2. Bump `VERSION` in `sw.js` and `APPV` in `index.html` (same value, e.g. `2026-12-01.1`).
3. Commit and push to `main`. GitHub Pages publishes it within a minute or two, and installed apps show **Update now** the next time they open online.
