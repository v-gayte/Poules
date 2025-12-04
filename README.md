# 🐔 Poules Tycoon

Un jeu tycoon de gestion de poulailler développé avec React, Phaser 3, TypeScript et Zustand.

## 🚀 Stack Technique

- **TypeScript** - Typage fort pour éviter les bugs
- **Vite** - Build tool ultra-rapide
- **React** - UI (HUD, Menus, Modales)
- **Phaser 3** - Moteur graphique pour la map (Canvas)
- **Zustand** - State management avec sauvegarde automatique (localStorage)
- **Tailwind CSS** - Styling rapide et cohérent
- **ESLint + Prettier** - Code quality et formatting

## 📁 Architecture

```
src/
├── components/          # Composants React (UI)
│   └── HUD/            # Interface utilisateur
├── phaser/              # Code Phaser (moteur graphique)
│   └── scenes/         # Scènes Phaser
├── stores/              # Stores Zustand (state management)
├── types/               # Types TypeScript
├── utils/               # Utilitaires
├── App.tsx              # Composant principal
└── main.tsx             # Point d'entrée
```

## 🛠️ Installation

```bash
npm install
```

## 🎮 Développement

```bash
npm run dev
```

Le serveur de développement démarre sur `http://localhost:5173`

## 📦 Build

```bash
npm run build
```

## 🧹 Linting & Formatting

```bash
# Linter le code
npm run lint

# Formatter le code
npm run format
```

## 📝 Notes d'Architecture

### Séparation des Responsabilités

- **React** : Gère uniquement l'UI (HUD, menus, modales)
- **Phaser** : Gère uniquement l'affichage de la map (Canvas, sprites, caméra)
- **Zustand** : Gère toute la logique du jeu (argent, énergie, bâtiments)

**Important** : Ne mettez jamais de logique métier dans Phaser. Phaser ne fait qu'afficher ce que React/Zustand lui dit d'afficher.

### Sauvegarde Automatique

Le store Zustand utilise le middleware `persist` qui sauvegarde automatiquement l'état dans le `localStorage`. Si le joueur ferme l'onglet et revient, il retrouve sa partie instantanément.

## 🎯 Prochaines Étapes

1. Ajouter des sprites pour les bâtiments
2. Implémenter le système de construction
3. Ajouter des menus d'upgrade
4. Implémenter la génération de revenus
5. Ajouter des arbres de compétences
