# Coffee Invitation

An elegant, minimal coffee invitation app built with HTML, CSS, JavaScript, and Firebase Firestore.

## Files

- `index.html` - invitation page
- `style.css` - responsive coffee-themed styling and animations
- `app.js` - interaction, Firestore writes, admin reads, and confetti
- `firebase-config.js` - Firebase project settings
- `admin.html` - optional private responses view

## Firebase setup

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a project.
3. Add a Web app.
4. Copy the Firebase config object.
5. Paste it into `firebase-config.js`.
6. In Firebase Console, open Firestore Database and create a database.
7. Start in production mode, then add rules that match your privacy needs.

Example development rules while testing:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /coffeeResponses/{docId} {
      allow create: if true;
      allow read: if false;
    }
  }
}
```

For `admin.html`, real privacy requires Firebase Authentication plus read rules limited to your account. The passcode in `firebase-config.js` only hides the page casually because static website code is visible in the browser.

## GitHub Pages deployment

1. Push this folder to `https://github.com/Devendar-Reddy17/Coffee.git`.
2. Open the repo on GitHub.
3. Go to Settings > Pages.
4. Set Source to `Deploy from a branch`.
5. Select `master` or `main`, then `/root`.
6. Save and wait for GitHub to publish the site.

## Firebase Hosting deployment

Install Firebase CLI, then run:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

During `firebase init hosting`, choose this folder as the public directory, keep it as a single-page app only if you want all routes to serve `index.html`, and do not overwrite existing files.

## Admin page

Open `admin.html` directly after deployment. Change `ADMIN_PASSCODE` in `firebase-config.js`, and protect Firestore reads with Firebase Auth rules before using it for anything private.
