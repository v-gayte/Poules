# 🏗️ Architecture du Projet Poules Tycoon

## 📂 Structure des Dossiers

```
poules/
├── public/                 # Assets statiques
├── src/
│   ├── components/         # Composants React (UI uniquement)
│   │   └── HUD/           # Interface utilisateur (HUD)
│   ├── phaser/            # Code Phaser (moteur graphique)
│   │   └── scenes/        # Scènes Phaser
│   ├── stores/            # Stores Zustand (state management)
│   ├── types/             # Types TypeScript globaux
│   ├── utils/             # Fonctions utilitaires
│   ├── App.tsx            # Composant principal React
│   └── main.tsx           # Point d'entrée
├── .vscode/               # Configuration VS Code
├── dist/                  # Build de production (généré)
└── node_modules/          # Dépendances (généré)
```

## 🎯 Séparation des Responsabilités

### React (`src/components/`)
- **Rôle** : Gère uniquement l'UI (HUD, menus, modales, arbres de compétences)
- **Ne doit PAS contenir** : Logique métier, calculs d'argent/CO2, gestion des bâtiments

### Phaser (`src/phaser/`)
- **Rôle** : Gère uniquement l'affichage de la map (Canvas, sprites, caméra, grille)
- **Ne doit PAS contenir** : Logique métier, état du jeu, calculs

### Zustand (`src/stores/`)
- **Rôle** : Gère TOUTE la logique du jeu (argent, énergie, bâtiments, CO2)
- **Sauvegarde automatique** : Le middleware `persist` sauvegarde dans `localStorage`

## 🔧 Fichiers de Configuration

- `vite.config.ts` - Configuration Vite
- `tsconfig.json` / `tsconfig.app.json` - Configuration TypeScript
- `tailwind.config.js` - Configuration Tailwind CSS
- `postcss.config.js` - Configuration PostCSS
- `.eslintrc.cjs` - Configuration ESLint (mode strict)
- `.prettierrc` - Configuration Prettier
- `.vscode/` - Configuration VS Code (extensions recommandées)

## 📦 Dépendances Principales

### Production
- `react` + `react-dom` - Framework UI
- `phaser` - Moteur graphique
- `zustand` - State management avec persist

### Développement
- `typescript` - Typage fort
- `vite` - Build tool
- `tailwindcss` - Styling
- `eslint` + `prettier` - Code quality

## 🚀 Commandes Disponibles

```bash
npm run dev      # Démarrer le serveur de développement
npm run build    # Build de production
npm run preview  # Prévisualiser le build
npm run lint     # Linter le code
npm run format   # Formatter le code
```

## 💾 Sauvegarde Automatique

Le store Zustand (`src/stores/gameStore.ts`) utilise le middleware `persist` qui :
- Sauvegarde automatiquement l'état dans `localStorage` à chaque changement
- Restaure automatiquement l'état au chargement de la page
- Clé de sauvegarde : `poules-tycoon-save`

## 🎮 Contrôles Phaser

- **Flèches directionnelles** : Déplacer la caméra
- **Molette de la souris** : Zoom in/out (0.5x à 2x)

## 📝 Prochaines Étapes

1. Ajouter des sprites pour les bâtiments
2. Implémenter le système de construction (clic sur la grille)
3. Créer des menus d'upgrade
4. Implémenter la génération de revenus automatique
5. Ajouter des arbres de compétences
6. Créer des modales d'informations

