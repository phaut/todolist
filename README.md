# todolist

Technologies:
React
Node.js
PostgreSQL

3️⃣ Installation et lancement

Installer toutes les dépendances :

npm install
cd renderer
npm install
cd ..

Développement (Vite + Electron) :
npm run dev

Build frontend pour production :
npm run build-renderer

Lancer Electron en production :
npm start

✅ Avec cette procédure complète :
database.db est créé automatiquement.
React peut interagir avec la base via window.dbAPI.
Dev et production fonctionnent correctement.
Lancer le build macOS

npm run build-mac
Electron-builder va :
Build ton frontend React (renderer/dist).
Copier tous les fichiers nécessaires.
Créer un .app ou un .dmg dans dist/mac/.
💡 Le fichier final sera quelque chose comme :
mon-app-desktop/dist/mac/Mon App Desktop.app
ou
mon-app-desktop/dist/mac/Mon App Desktop.dmg