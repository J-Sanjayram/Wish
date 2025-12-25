# Firebase Setup Instructions

## 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "birthday-wishes")
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for now
4. Select a location close to your users
5. Click "Done"

## 3. Enable Firebase Storage
1. Go to "Storage" in Firebase Console
2. Click "Get started"
3. Choose "Start in test mode"
4. Select same location as Firestore
5. Click "Done"

## 4. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>) to add web app
4. Enter app nickname (e.g., "birthday-wishes-web")
5. Don't check "Firebase Hosting" for now
6. Click "Register app"
7. Copy the firebaseConfig object

## 5. Update index.html
Replace the firebaseConfig in index.html with your actual config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-actual-sender-id",
    appId: "your-actual-app-id"
};
```

## 6. Security Rules (Optional - for production)
### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /wishes/{document} {
      allow read, write: if true;
    }
  }
}
```

### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /wish-images/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## Features Included:
- ✅ Firestore for storing wish data
- ✅ Firebase Storage for images
- ✅ Image compression (400px max)
- ✅ Automatic image upload
- ✅ Global wish sharing via URLs
- ✅ Real-time data storage