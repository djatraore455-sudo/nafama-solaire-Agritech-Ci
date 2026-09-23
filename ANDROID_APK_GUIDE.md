# Guide de Génération de l'APK Android (Android Studio)
## Application : NAFAMA SOLAIRE (ci.nafamasolaire.app)

Ce guide vous donne les étapes pas à pas pour transformer cette application web/React en **fichier APK installable sur smartphone Android** via **Android Studio** et **Capacitor**.

---

### ÉTAPE 1 : Télécharger ou cloner le projet sur votre ordinateur
1. Téléchargez les fichiers de votre projet dans un dossier local (ex: `nafama-solaire`).
2. Ouvrez un terminal dans ce dossier et assurez-vous d'avoir [Node.js](https://nodejs.org/) installé.

---

### ÉTAPE 2 : Compiler l'application Web
Dans le terminal de votre projet, exécutez :
```bash
npm install
npm run build
```
*(Cela génère le dossier de production `/dist` contenant tout le code optimisé).*

---

### ÉTAPE 3 : Ajouter Capacitor et la plateforme Android
Installez les outils officiels Capacitor recommandés par Google et l'écosystème Android :
```bash
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli
```

Puis initialisez et créez le projet Android natif :
```bash
npx cap add android
npx cap sync android
```
*(Cette commande crée automatiquement un vrai projet Android natif dans le sous-dossier `/android`).*

---

### ÉTAPE 4 : Ouvrir le projet dans Android Studio
Exécutez simplement la commande suivante :
```bash
npx cap open android
```
*(Android Studio se lance et indexe le projet Gradle automatiquement).*

---

### ÉTAPE 5 : Configurer les permissions Android (Internet, Téléphone, SMS, Caméra)
Ouvrez le fichier `android/app/src/main/AndroidManifest.xml` dans Android Studio et vérifiez la présence des permissions nécessaires pour NAFAMA SOLAIRE :
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Connexion Internet & Firebase -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Appels direct au conseiller agricole & urgence (+225 64 64 84 39 12) -->
    <uses-permission android:name="android.permission.CALL_PHONE" />

    <!-- Photos de récoltes et de pompes solaires -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
...
```

---

### ÉTAPE 6 : Générer l'APK dans Android Studio

#### Option A : Générer un APK de test / débogage (Immédiat, sans signature)
1. Dans le menu supérieur d'Android Studio, cliquez sur :  
   **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. Attendez 1 à 2 minutes pendant que Gradle compile.
3. En bas à droite d'Android Studio, une notification s'affiche :  
   `APK(s) generated successfully for 1 module`.
4. Cliquez sur **locate** : votre fichier **`app-debug.apk`** est prêt ! Vous pouvez l'envoyer sur WhatsApp ou par câble USB sur n'importe quel smartphone Android pour l'installer.

#### Option B : Générer un APK signé pour la distribution / Play Store
1. Cliquez sur **Build** > **Generate Signed Bundle / APK...**
2. Sélectionnez **APK** (ou *Android App Bundle* pour le Google Play Store) puis cliquez sur **Next**.
3. Créez votre clé secrète (*Key store path*), mot de passe et alias.
4. Sélectionnez **release**, cochez **V1** et **V2 (Full APK Signature)**.
5. Cliquez sur **Finish** : votre fichier **`app-release.apk`** est prêt pour la diffusion commerciale.

---

### Configuration Firebase pour Android (Optionnel pour SMS / Auth)
Pour que l'authentification Google et OTP SMS fonctionne également dans l'APK natif :
1. Dans la [console Firebase](https://console.firebase.google.com/), cliquez sur **Ajouter une application** > icône **Android**.
2. Renseignez le nom du package : `ci.nafamasolaire.app`.
3. Téléchargez le fichier **`google-services.json`** et collez-le dans le dossier `android/app/` du projet.
