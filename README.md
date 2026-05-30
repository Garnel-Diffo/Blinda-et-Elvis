<div align="center">

# 💍 Blinda & Elvis — Site de Mariage

### 🌿✨ Le Jardin de Paix et de Joie ✨🌿

**Application web full-stack pour la gestion du mariage de Blinda & Elvis**  
*20 Juin 2026 — Yaoundé, Cameroun*

---

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)

</div>

---

## 📋 Sommaire

- [📖 À propos du projet](#-à-propos-du-projet)
- [✨ Fonctionnalités](#-fonctionnalités)
  - [🌸 Côté Utilisateur](#-côté-utilisateur)
  - [🔐 Côté Administrateur](#-côté-administrateur)
- [🛠️ Stack Technique](#️-stack-technique)
- [📁 Structure du Projet](#-structure-du-projet)
- [⚙️ Installation & Configuration](#️-installation--configuration)
  - [Prérequis](#prérequis)
  - [Cloner & Installer](#cloner--installer)
  - [Variables d'Environnement](#variables-denvironnement)
- [🚀 Lancement](#-lancement)
  - [Mode Développement](#mode-développement)
  - [Mode Production](#mode-production)
- [🗄️ Base de Données](#️-base-de-données)
- [🔌 API — Endpoints](#-api--endpoints)
  - [Routes Publiques](#routes-publiques)
  - [Routes Admin (token requis)](#routes-admin-token-requis)
- [🎫 Générateur de Billets PDF](#-générateur-de-billets-pdf)
- [🖼️ Photos & Assets](#️-photos--assets)
- [🔑 Panneau Administrateur](#-panneau-administrateur)
- [🎨 Thème & Charte Graphique](#-thème--charte-graphique)
- [👤 Auteur](#-auteur)

---

## 📖 À propos du projet

Site web officiel du mariage de **Blinda & Elvis**, conçu sous le thème **« Le Jardin de Paix et de Joie »**.

Il s'agit d'une application web full-stack complète comprenant :
- Un **site public** élégant et animé pour présenter toutes les informations du mariage
- Un **espace invités** avec formulaire de confirmation de présence (RSVP)
- Un **panneau administrateur** sécurisé pour la gestion des invités et la génération de billets PDF personnalisés

> **Date du mariage :** Samedi 20 Juin 2026  
> **Thème :** 🌿 Le Jardin de Paix et de Joie  
> **Couleurs officielles :** 💙 Bleu Ciel · 💛 Or · 🤍 Blanc

---

## ✨ Fonctionnalités

### 🌸 Côté Utilisateur

| Section | Description |
|---|---|
| **Hero** | Photo de fond plein écran avec effet Ken Burns, noms en police script avec glow doré, compte à rebours en temps réel, pétales flottants animés |
| **Programme** | Les 3 événements du 20 Juin (08h30 Mariage Civil · 14h30 Bénédiction · 20h00 Soirée Festive) avec cartes animées et icônes colorées |
| **Galerie** | Grille masonry de 11 photos avec hover, lightbox avec navigation clavier (← →, Échap) |
| **Code Vestimentaire** | Les 3 couleurs officielles (Bleu Ciel, Or, Blanc) avec descriptions et photo du pagne officiel |
| **RSVP** | Formulaire de confirmation de présence connecté à la base de données |
| **Footer** | Coordonnées de l'équipe de développement, liens de navigation, lien admin discret |

#### Formulaire RSVP
- **Champs obligatoires :** Prénom, Nom
- **Champs optionnels :** Téléphone (avec indicatif 🇨🇲 +237 par défaut, 6 pays disponibles), Email
- Validation en temps réel, animation de succès
- Données stockées dans la base de données PostgreSQL (Neon)

### 🔐 Côté Administrateur

| Page | Fonctionnalités |
|---|---|
| **Connexion** | Authentification par mot de passe, token JWT simple stocké dans localStorage |
| **Tableau de bord** | Vue d'ensemble : nombre d'invités, jours restants, programme du 20 Juin, accès rapide |
| **Liste des invités** | Tableau trié et filtrable, recherche en temps réel, suppression avec confirmation, statistiques (total, téléphones, emails) |
| **Générateur de billets** | Upload template, éditeur visuel de placement, génération PDF individuelle ou groupée (ZIP) |

#### Export & Sécurité des données
- **Export Excel** : télécharge toutes les données invités en fichier `.xlsx` (backup de sécurité)
- **Export ZIP** : tous les billets PDF en un seul téléchargement

---

## 🛠️ Stack Technique

### Frontend
| Technologie | Version | Rôle |
|---|---|---|
| [React](https://reactjs.org/) | 18.x | Interface utilisateur |
| [Vite](https://vitejs.dev/) | 6.x | Bundler & serveur de développement |
| [TailwindCSS](https://tailwindcss.com/) | 3.x | Styles utilitaires |
| [Framer Motion](https://www.framer.com/motion/) | 11.x | Animations fluides |
| [React Router DOM](https://reactrouter.com/) | 7.x | Routing client |
| [Lucide React](https://lucide.dev/) | latest | Icônes SVG |
| [React Hot Toast](https://react-hot-toast.com/) | latest | Notifications toast |
| [React Intersection Observer](https://github.com/thebuilder/react-intersection-observer) | latest | Animations au scroll |
| [Axios](https://axios-http.com/) | latest | Client HTTP |
| [File Saver](https://github.com/eligrey/FileSaver.js) | latest | Téléchargements côté client |

### Backend
| Technologie | Version | Rôle |
|---|---|---|
| [Express.js](https://expressjs.com/) | 4.x | Serveur HTTP REST API |
| [node-postgres (pg)](https://node-postgres.com/) | 8.x | Client PostgreSQL |
| [Multer](https://github.com/expressjs/multer) | latest | Upload de fichiers |
| [pdf-lib](https://pdf-lib.js.org/) | 1.x | Génération de PDFs |
| [JSZip](https://stuk.github.io/jszip/) | 3.x | Création d'archives ZIP |
| [xlsx (SheetJS)](https://sheetjs.com/) | latest | Export Excel |
| [cors](https://github.com/expressjs/cors) | latest | CORS middleware |
| [dotenv](https://github.com/motdotla/dotenv) | latest | Variables d'environnement |

### Base de données
- **[Neon PostgreSQL](https://neon.tech/)** — Base de données serverless PostgreSQL hébergée dans le cloud

---

## 📁 Structure du Projet

```
blinda-et-elvis/
│
├── 📄 package.json              # Dépendances & scripts npm
├── 📄 vite.config.js            # Configuration Vite + proxy API
├── 📄 tailwind.config.js        # Thème personnalisé (couleurs, animations)
├── 📄 postcss.config.js         # PostCSS pour Tailwind
├── 📄 index.html                # Point d'entrée HTML (Google Fonts)
├── 📄 .env                      # Variables d'environnement (NON versionné)
├── 📄 .env.example              # Modèle de configuration
├── 📄 vercel.json               # Configuration déploiement Vercel
│
├── 📁 api/                      # ⚡ Vercel Serverless Functions (production)
│   ├── 📄 _db.js                # Pool PostgreSQL partagé
│   ├── 📄 _auth.js              # Middleware d'authentification
│   ├── 📄 rsvp.js               # POST /api/rsvp (public)
│   ├── 📄 count.js              # GET /api/count (public)
│   ├── 📁 admin/
│   │   ├── 📄 login.js          # POST /api/admin/login
│   │   └── 📄 verify.js         # GET /api/admin/verify
│   ├── 📁 reservations/
│   │   ├── 📄 index.js          # GET /api/reservations (liste)
│   │   ├── 📄 [id].js           # DELETE /api/reservations/:id
│   │   └── 📁 export/
│   │       └── 📄 excel.js      # GET /api/reservations/export/excel
│   └── 📁 tickets/
│       ├── 📄 upload.js         # POST /api/tickets/upload (base64)
│       ├── 📄 config.js         # GET/POST /api/tickets/config
│       ├── 📄 template.js       # GET /api/tickets/template (image)
│       ├── 📄 generate-all.js   # GET /api/tickets/generate-all (ZIP)
│       └── 📁 generate/
│           └── 📄 [id].js       # GET /api/tickets/generate/:id (PDF)
│
├── 📁 server/                   # 🖥️ Express local dev (développement uniquement)
│   ├── 📄 index.js              # Serveur principal, routes, auth middleware
│   ├── 📄 db.js                 # Pool PostgreSQL + initialisation table
│   └── 📁 routes/
│       ├── 📄 reservations.js   # CRUD invités + export Excel
│       └── 📄 tickets.js        # Upload template, config, génération PDF/ZIP
│
├── 📁 src/                      # Frontend React
│   ├── 📄 main.jsx              # Point d'entrée React
│   ├── 📄 App.jsx               # Router principal
│   ├── 📄 index.css             # Styles globaux + composants Tailwind
│   │
│   ├── 📁 assets/
│   │   └── 📁 images/           # 12 photos du couple (optimisées par Vite)
│   │       ├── couronne.jpeg
│   │       ├── pagne-officiel.jpeg
│   │       ├── pagne-dos.jpeg
│   │       └── ...
│   │
│   ├── 📁 utils/
│   │   └── 📄 api.js            # Fonctions API (public + admin avec auth)
│   │
│   ├── 📁 pages/
│   │   ├── 📄 HomePage.jsx      # Page principale (site mariage)
│   │   └── 📄 AdminPage.jsx     # Gestionnaire admin (auth + routing)
│   │
│   └── 📁 components/
│       ├── 📁 shared/
│       │   ├── 📄 Navbar.jsx        # Navigation fixe avec scroll actif
│       │   ├── 📄 Footer.jsx        # Pied de page + crédits
│       │   └── 📄 FloatingPetals.jsx# Pétales SVG animés
│       │
│       ├── 📁 home/
│       │   ├── 📄 Hero.jsx          # Section hero (image bg + countdown)
│       │   ├── 📄 Program.jsx       # Programme du 20 Juin
│       │   ├── 📄 Gallery.jsx       # Galerie photos + lightbox
│       │   ├── 📄 DressCode.jsx     # Couleurs + pagne officiel
│       │   └── 📄 RSVP.jsx          # Formulaire de confirmation
│       │
│       └── 📁 admin/
│           ├── 📄 AdminLogin.jsx    # Page de connexion admin
│           ├── 📄 AdminLayout.jsx   # Layout sidebar + topbar
│           ├── 📄 Dashboard.jsx     # Tableau de bord
│           ├── 📄 GuestList.jsx     # Liste invités + recherche + export
│           └── 📄 TicketGenerator.jsx# Éditeur visuel + génération PDF
│
└── 📁 public/
    ├── 📄 favicon.svg
    └── 📁 uploads/              # Templates uploadés + config tickets (créé auto)
        ├── ticket-template.jpg  # (généré après upload)
        └── ticket-config.json   # (généré après configuration)
```

---

## ⚙️ Installation & Configuration

### Prérequis

- **Node.js** ≥ 18.x ([Télécharger](https://nodejs.org/))
- **npm** ≥ 9.x (inclus avec Node.js)
- Accès Internet (pour Google Fonts et la base de données Neon)

### Cloner & Installer

```bash
# 1. Cloner le dépôt (ou ouvrir le dossier)
cd "d:/Projets/Blinda-et-Elvis"

# 2. Installer toutes les dépendances (frontend + backend)
npm install
```

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
# Base de données Neon PostgreSQL
DATABASE_URL=postgresql://neondb_owner:<PASSWORD>@<HOST>/neondb?sslmode=require

# Mot de passe administrateur (à personnaliser !)
ADMIN_PASSWORD=BlindaElvis2026

# Port du serveur Express (optionnel, défaut: 3001)
PORT=3001

# Environnement
NODE_ENV=development
```

> ⚠️ **Important :** Ne jamais commiter le fichier `.env` dans git. Il est déjà dans `.gitignore`.

---

## ☁️ Déploiement sur Vercel

### Architecture de déploiement

```
┌─────────────────────────────────────────────────────────────────┐
│                      vercel.app (production)                    │
│                                                                 │
│  ┌─────────────────────┐    ┌──────────────────────────────┐   │
│  │  dist/ (React SPA)  │    │   api/ (Serverless Functions) │   │
│  │  Fichiers statiques │    │   Node.js — connexion à Neon  │   │
│  └─────────────────────┘    └──────────────────────────────┘   │
│                                                                 │
│  • /              → index.html (SPA)                           │
│  │  /admin        → index.html (React Router)                  │
│  └─────────────────────────────────────────────────────────────│
│  • /api/*         → Serverless Functions                       │
└─────────────────────────────────────────────────────────────────┘
```

> ⚠️ **Important :** Vercel ne peut pas faire tourner un serveur Express classique.  
> Ce projet utilise des **Vercel Serverless Functions** dans `api/` pour la production,  
> et garde l'Express dans `server/` uniquement pour le développement local.

### Étapes de déploiement

#### 1. Pousser sur GitHub

```bash
git add .
git commit -m "feat: Blinda & Elvis wedding website"
git push origin main
```

#### 2. Importer dans Vercel

1. Aller sur [vercel.com](https://vercel.com) → **New Project**
2. Importer le dépôt GitHub
3. Framework : **Vite** (détecté automatiquement)
4. Build Command : `npm run build`
5. Output Directory : `dist`

#### 3. Variables d'environnement sur Vercel

Dans **Settings → Environment Variables**, ajouter :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:...@.../neondb?sslmode=require` |
| `ADMIN_PASSWORD` | `BlindaElvis2026` |

> Le `PORT` n'est pas nécessaire sur Vercel.

#### 4. Déployer

Cliquer sur **Deploy** — Vercel build le frontend et configure les fonctions automatiquement.

### Différences local vs Vercel

| Fonctionnalité | Local (Express) | Vercel (Serverless) |
|---|---|---|
| Upload template | Sauvegardé dans `public/uploads/` | Sauvegardé en base64 dans PostgreSQL |
| Affichage template | URL directe `/uploads/...` | Via API authentifiée `/api/tickets/template` |
| Réservations | PostgreSQL (Neon) | PostgreSQL (Neon) |
| PDF génération | pdf-lib (filesystem) | pdf-lib (in-memory) |
| ZIP billets | jszip | jszip |

---

## 🚀 Lancement

### Mode Développement

Lance simultanément le serveur Express (port 3001) et le serveur Vite (port 5173) :

```bash
npm run dev
```

| Service | URL |
|---|---|
| 🌸 **Site public** | http://localhost:5173 |
| 🔐 **Admin** | http://localhost:5173/admin |
| ⚙️ **API** | http://localhost:3001/api |

Pour lancer uniquement le serveur backend :
```bash
npm run server
# ou
node server/index.js
```

Pour lancer uniquement le frontend :
```bash
npx vite
# ou (Windows)
.\node_modules\.bin\vite.cmd
```

### Mode Production

```bash
# 1. Construire le frontend
npm run build

# 2. Lancer le serveur (sert le build statique + l'API)
NODE_ENV=production npm start
```

Le site sera accessible sur : **http://localhost:3001**

---

## 🗄️ Base de Données

La table est créée **automatiquement** au démarrage du serveur si elle n'existe pas.

### Schéma SQL

```sql
CREATE TABLE IF NOT EXISTS reservations (
  id          SERIAL PRIMARY KEY,
  nom         VARCHAR(100) NOT NULL,
  prenom      VARCHAR(100) NOT NULL,
  telephone   VARCHAR(25),
  email       VARCHAR(150),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Connexion

Le projet utilise **[Neon](https://neon.tech/)**, une base de données PostgreSQL serverless.
La connexion est gérée par un pool de 10 connexions max avec SSL activé.

> Le paramètre `channel_binding=require` de l'URL Neon est automatiquement retiré pour la compatibilité avec la bibliothèque `pg`.

---

## 🔌 API — Endpoints

### Routes Publiques

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/rsvp` | Soumettre une confirmation de présence |
| `GET` | `/api/count` | Nombre total d'invités confirmés |
| `POST` | `/api/admin/login` | Connexion administrateur |
| `GET` | `/api/admin/verify` | Vérifier la validité du token |

#### Exemple — Soumettre un RSVP
```bash
curl -X POST http://localhost:3001/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{"nom":"Dupont","prenom":"Marie","telephone":"+237 699123456","email":"marie@example.cm"}'
```

#### Exemple — Connexion admin
```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"BlindaElvis2026"}'
# Réponse: {"success":true,"token":"<base64_token>"}
```

---

### Routes Admin (token requis)

Toutes les routes admin nécessitent le header :
```
Authorization: Bearer <token>
```

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reservations` | Liste de tous les invités |
| `GET` | `/api/reservations?search=xyz` | Recherche dans les invités |
| `DELETE` | `/api/reservations/:id` | Supprimer un invité |
| `GET` | `/api/reservations/export/excel` | Export Excel (.xlsx) |
| `POST` | `/api/tickets/upload` | Upload du template de billet |
| `GET` | `/api/tickets/config` | Lire la configuration des billets |
| `POST` | `/api/tickets/config` | Sauvegarder la configuration |
| `GET` | `/api/tickets/generate/:id` | Générer le billet PDF d'un invité |
| `GET` | `/api/tickets/generate-all` | Générer tous les billets (ZIP) |

#### Exemple — Récupérer les invités
```bash
TOKEN="<votre_token>"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/reservations
```

---

## 🎫 Générateur de Billets PDF

Le générateur fonctionne en 4 étapes simples depuis le panneau admin :

### Étape 1 — Upload du template
- Cliquez sur la zone d'upload ou faites un glisser-déposer
- Formats acceptés : **JPG, PNG**
- Taille max : 15 Mo
- Le template est sauvegardé dans `public/uploads/`

### Étape 2 — Placement du nom
- Le template s'affiche dans un éditeur interactif
- **Cliquez et faites glisser** pour dessiner un cadre sur l'image
- Ce cadre indique la zone où sera inscrit le nom de chaque invité
- Les coordonnées sont sauvegardées en pourcentages (compatible toutes tailles)

### Étape 3 — Style du texte
- **Taille de police** : curseur de 12px à 72px
- **Couleur du texte** : 6 couleurs prédéfinies + sélecteur de couleur personnalisé

### Étape 4 — Génération
- **Billet individuel** : cliquez sur le bouton à côté du nom de l'invité → téléchargement PDF
- **Tous les billets** : cliquez sur "Tous les billets (ZIP)" → archive ZIP contenant tous les PDFs

> 💡 **Format des noms dans les PDFs :** `Prénom NOM` (ex: `Marie MBALLA`)

### Fonctionnement interne (pdf-lib)
```
Template JPG/PNG + Coordonnées (%) + Nom invité
      ↓
Création page PDF aux dimensions de l'image
      ↓
Insertion image en fond + texte centré dans la zone
      ↓
PDF téléchargeable
```

---

## 🖼️ Photos & Assets

Les 12 photos sont stockées dans `src/assets/images/` et optimisées automatiquement par Vite au build.

| Fichier | Description | Utilisation |
|---|---|---|
| `couronne.jpeg` | Couple avec couronne | Photo dans le Hero (cercle) |
| `pagne-dos.jpeg` | Couple, femme dos de l'homme | **Image de fond du Hero** |
| `pagne-officiel.jpeg` | Tissu pagne officiel | Section Code Vestimentaire |
| `photo-1.jpeg` | Portrait couple | Galerie |
| `photo-2.jpeg` | Portrait couple | Galerie |
| `photo-3.jpeg` | Portrait couple | Galerie |
| `bague.jpeg` | Bague au doigt | Galerie |
| `pagne-1.jpeg` | Couple en pagne | Galerie |
| `pagne-2.jpeg` | Couple en pagne | Galerie |
| `jogging-assis.jpeg` | Couple en jogging assis | Galerie |
| `jogging-pied.jpeg` | Couple en jogging debout | Galerie |
| `save-the-date.jpeg` | Photo Save the Date | Galerie |

---

## 🔑 Panneau Administrateur

Accessible à l'URL : **`/admin`**

### Connexion
```
Mot de passe : BlindaElvis2026
```
*(Configurable via la variable `ADMIN_PASSWORD` dans `.env`)*

### Fonctionnalités disponibles

#### 📊 Tableau de bord
- Nombre d'invités confirmés en temps réel
- Nombre de jours restants avant le mariage
- Rappel du programme de la journée
- Accès rapide aux autres sections

#### 👥 Liste des invités
- **Tri** par prénom, nom, téléphone, email ou date d'inscription (clic sur l'en-tête)
- **Recherche** en temps réel (nom, prénom, email, téléphone)
- **Suppression** avec modal de confirmation
- **Export Excel** : génère un fichier `.xlsx` avec toutes les données
- Statistiques : total invités / avec téléphone / avec email

#### 🎫 Générateur de billets
Voir la section [🎫 Générateur de Billets PDF](#-générateur-de-billets-pdf) ci-dessus.

### Sécurité de l'authentification
Le token est un encodage Base64 du mot de passe admin, stocké dans `localStorage`.
Il est transmis dans le header `Authorization: Bearer <token>` pour toutes les requêtes protégées.

> Note : Pour un usage en production plus sécurisé, envisagez de remplacer par un JWT signé avec expiration.

---

## 🎨 Thème & Charte Graphique

### Palette de couleurs

| Couleur | Hex | Signification |
|---|---|---|
| **Bleu Ciel** | `#0EA5E9` | Paix & Sérénité |
| **Or/Ambre** | `#F59E0B` | Gloire & Valeur |
| **Blanc Crème** | `#FDF8F0` | Pureté & Lumière |
| **Pétale** | `#FB7185` | Douceur & Amour |
| **Marine** | `#1E1B4B` | Élégance (admin) |

### Typographie

| Police | Famille | Usage |
|---|---|---|
| [Great Vibes](https://fonts.google.com/specimen/Great+Vibes) | Script | Noms du couple, titres romantiques |
| [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) | Serif | Titres de sections, headings |
| [Lato](https://fonts.google.com/specimen/Lato) | Sans-serif | Corps de texte, formulaires |

### Animations
- **Framer Motion** : entrées, transitions, hover, layout animations
- **Parallaxe** : image de fond du Hero avec `useScroll` + `useTransform`
- **Ken Burns** : zoom lent sur l'image de fond
- **Pétales** : 22 pétales SVG flottants avec physique aléatoire
- **Countdown** : mise à jour toutes les secondes avec animation de changement

---

## 👤 Auteur

<div align="center">

**Conception & Développement**

### Ing. Garnel DIFFO

[![WhatsApp](https://img.shields.io/badge/WhatsApp-+237_674_318_296-25D366?style=for-the-badge&logo=whatsapp)](https://wa.me/237674318296)
[![Email](https://img.shields.io/badge/Email-diffogarnel@gmail.com-EA4335?style=for-the-badge&logo=gmail)](mailto:diffogarnel@gmail.com)

</div>

---

<div align="center">

*© 2026 Blinda & Elvis · Tous droits réservés*

**Fait avec ❤️ pour le plus beau jour de leur vie**

🌿✨ *Le Jardin de Paix et de Joie* ✨🌿

</div>
