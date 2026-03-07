# 📋 CAHIER DES CHARGES — Plateforme E-Commerce Automobile
### Version 2.0 | React 18 + Vite | Déploiement : Vercel | Mise à jour : 27 Février 2026

---

## 1. PRÉSENTATION DU PROJET

**Nom du projet :** AutoImport Pro  
**Type :** Plateforme e-commerce automobile avec interface administrateur intégrée  
**Stack technique :** React 18 + Vite · Tailwind CSS · Firebase (Firestore + Auth — Formule Spark) · Cloudinary (stockage images/PDF) · Vercel  
**Architecture :** Monorepo (App Client + App Admin dans le même dépôt GitHub)  
**Langues supportées :** 🇫🇷 Français · 🇬🇧 Anglais · 🇩🇪 Allemand · 🇵🇹 Portugais · 🇪🇸 Espagnol · 🇮🇹 Italien · 🇷🇴 Roumain · 🇳🇱 Néerlandais *(8 langues)*

---

## 2. ARCHITECTURE TECHNIQUE

```
/
├── src/
│   ├── client/                  → Application publique (vitrine)
│   │   ├── pages/
│   │   ├── components/
│   │   └── i18n/                → fr / en / de / pt / es / it / ro / nl
│   ├── admin/                   → Interface d'administration (protégée)
│   │   ├── pages/
│   │   └── components/
│   ├── shared/                  → Composants et hooks partagés
│   ├── firebase/                → Config Firestore + Auth
│   ├── cloudinary/              → Config upload / fetch médias
│   └── store/                   → État global (Zustand)
├── public/
├── vercel.json
└── package.json
```

### 2.1 Base de données — Firebase Firestore (Spark)

| Collection | Contenu |
|---|---|
| `vehicles` | Tous les véhicules (données + URLs Cloudinary) |
| `orders` | Commandes clients |
| `clients` | Comptes clients (avec statut bloqué/actif) |
| `settings` | Paramètres globaux (logo, RIB, WhatsApp, Facebook, etc.) |
| `banners` | Bannières hero (image, titre, sous-titre, CTA) |
| `categories` | Catégories/marques (nom, image, ordre) |
| `promotions` | Règles promotionnelles actives |
| `contracts` | Contrats de vente générés |

### 2.2 Stockage médias — Cloudinary (gratuit)

- Upload des photos véhicules (transformations automatiques : resize, webp, lazy)
- Stockage des PDF (fiches techniques auto-générées)
- Stockage du logo de la société
- Stockage des images de bannières
- Stockage du cachet et de la signature du responsable des ventes

### 2.3 Authentification — Firebase Auth (Spark)

- Connexion admin par email + mot de passe
- Session persistante (token Firebase)
- Gestion des comptes clients (blocage/déblocage)

---

## 3. APPLICATION CLIENT (VITRINE)

### 3.1 Pages

| Page | URL | Description |
|---|---|---|
| Accueil | `/` | Hero banner, catégories, offres phares |
| Catalogue | `/catalogue` | Liste de tous les véhicules avec filtres |
| Catégorie | `/categorie/:marque` | Véhicules filtrés par marque |
| Fiche véhicule | `/vehicule/:id` | Détail complet d'un véhicule |
| Commande | `/commande` | Formulaire de commande |
| Confirmation | `/confirmation/:orderId` | Récapitulatif + bon de commande |
| À propos | `/a-propos` | Présentation de l'entreprise |
| Contact | `/contact` | Formulaire de contact + liens sociaux |
| Témoignages | `/temoignages` | Avis clients |
| Mentions légales | `/mentions-legales` | CGV, politique de confidentialité |
| Mon compte | `/compte` | Espace client (commandes, profil) |
| Connexion | `/connexion` | Login client |
| Inscription | `/inscription` | Création de compte client |

### 3.2 Header / Navigation

- **Logo** : image cliquable, configurable depuis l'admin (stocké sur Cloudinary)
- **Nom de la société** : texte configurable depuis l'admin
- **Adresse** : configurable depuis l'admin, affichée dans le footer
- **Sélecteur de langue** : icône drapeau + menu déroulant (8 langues)
- **Navigation** : liens vers toutes les pages principales
- **Catégories** : menu déroulant par marque automobile (catégories gérées depuis l'admin)
- **Bouton WhatsApp** : icône verte, lien configurable depuis l'admin
- **Bouton Facebook** : icône bleue, lien configurable depuis l'admin
- **Compte client** : icône profil → connexion/espace client
- **Barre de recherche** : recherche rapide par marque, modèle, mot-clé

### 3.3 Page d'accueil

#### Bannières hero (carousel)
- Slideshow automatique avec transition fluide
- Chaque bannière : image de fond, titre, sous-titre, bouton CTA
- Images, textes et liens 100% configurables depuis l'admin
- Ordre configurable par drag & drop (admin)

#### Section catégories
- Grille visuelle avec image et nom de chaque marque/catégorie
- Catégories ajoutables/supprimables depuis l'admin à tout moment
- Clic → redirection vers le catalogue filtré par marque

#### Section "Nos meilleures offres"
- Véhicules mis en avant par l'admin
- Badges dynamiques : `% de réduction`, `VENDU`, `Coup de cœur`, `Promo`

### 3.4 Fiche véhicule (page produit)

**Galerie photos :**
- Slider avec miniatures (images Cloudinary optimisées)
- Zoom au survol
- Mode plein écran / lightbox
- Badge `VENDU` en overlay rouge si statut vendu

**Informations affichées :**
- Marque, modèle, année
- Prix original (barré) et prix de vente
- Si promotion active → prix réduit calculé automatiquement + badge coloré (ex: `-20%`)
- Description complète (rendu HTML depuis éditeur riche)
- Tableau des caractéristiques techniques :

| Champ | Exemple |
|---|---|
| Kilométrage | 87 000 km |
| Carburant | Diesel |
| Boîte de vitesses | Automatique |
| Puissance | 150 ch / 110 kW |
| Couleur | Gris Métallisé |
| Nombre de portes | 5 |
| Nombre de places | 5 |
| Contrôle technique | Oui — valide jusqu'au 03/2026 |
| Pays d'origine | Allemagne 🇩🇪 |
| Première mise en circulation | 03/2021 |
| Numéro de série (VIN) | *(optionnel)* |

- Options et équipements (liste avec icônes)

**Actions disponibles :**
- Bouton **"Commander"** → formulaire de commande (désactivé si vendu)
- Bouton **"Contacter sur WhatsApp"** → `wa.me/[NUMÉRO]?text=Bonjour, intéressé par : [MARQUE MODÈLE] – [URL]`
- Bouton **"Télécharger la fiche technique"** → PDF auto-généré depuis les données admin (voir 4.2)
- **Partage multi-canal** (bouton dropdown) :
  - 📱 WhatsApp : `https://wa.me/?text=[URL encodée]`
  - 📧 Email : `mailto:?subject=Véhicule%20à%20voir&body=[URL]`
  - 📘 Meta / Facebook : `https://www.facebook.com/sharer/sharer.php?u=[URL]`
- Paiement en plusieurs fois : simulation des mensualités si activé

**Badge "VENDU" :**
- Overlay rouge sur toutes les photos
- Bouton "Commander" grisé + message "Ce véhicule est vendu"
- Section "Véhicules similaires" affichée en dessous

### 3.5 Formulaire de commande

Champs obligatoires :
- Nom complet / Prénom
- Email / Téléphone
- Adresse complète / Pays
- Mode de paiement : comptant ou en plusieurs fois (si activé)
- Montant de l'acompte (si paiement fractionné)
- Message optionnel

À la validation :
- Génération automatique du **bon de commande PDF** (voir 4.1)
- Envoi email : client + admin (via EmailJS)
- Page de confirmation avec récapitulatif complet
- Affichage du **RIB** de l'entreprise pour le virement (configurable admin)

### 3.6 Espace client (compte)

- Inscription / Connexion (Firebase Auth)
- Historique des commandes avec statuts
- Téléchargement des bons de commande passés
- Modification du profil
- ⚠️ Si le compte est **bloqué** par l'admin : accès refusé avec message d'information

### 3.7 Système de promotions

- Si une promotion est active (globale ou sélection), le prix s'affiche avec :
  - Prix original **barré**
  - Prix réduit calculé automatiquement (10%, 20% ou 30%)
  - Badge coloré `PROMO -X%` visible sur la vignette ET sur la fiche produit
- La réduction agit en temps réel dès activation depuis l'admin

---

## 4. GÉNÉRATION AUTOMATIQUE DES DOCUMENTS PDF

### 4.1 Bon de commande (généré à la commande client)

Généré côté client avec `jsPDF` + `html2canvas` :

```
┌──────────────────────────────────────────────┐
│  [LOGO]     NOM DE LA SOCIÉTÉ                │
│             Adresse | Email | Téléphone       │
├──────────────────────────────────────────────┤
│  BON DE COMMANDE N° [AUTO-GÉNÉRÉ]            │
│  Date : [DATE]                               │
├──────────────────────────────────────────────┤
│  CLIENT                                      │
│  Nom, Prénom, Adresse, Téléphone, Email      │
├──────────────────────────────────────────────┤
│  VÉHICULE COMMANDÉ                           │
│  [Photo miniature] | Marque | Modèle         │
│  Année | Kilométrage | Carburant             │
│  Prix : XXX €  (promo appliquée si active)   │
├──────────────────────────────────────────────┤
│  MODE DE PAIEMENT                            │
│  Comptant / En X fois                        │
│  Acompte : XXX €                             │
├──────────────────────────────────────────────┤
│  COORDONNÉES BANCAIRES (RIB)                 │
│  Titulaire : ...  │  IBAN : ...              │
│  BIC : ...        │  Banque : ...            │
├──────────────────────────────────────────────┤
│  Mentions légales                            │
│                                              │
│  Signature client :    Responsable ventes :  │
│  _______________       [CACHET + SIGNATURE]  │
└──────────────────────────────────────────────┘
```

- Numéro auto-incrémenté stocké dans Firestore
- Nom de fichier : `BonCommande_[N°]_[Prénom]_[Nom].pdf`
- La **signature** et le **cachet** du responsable sont des images uploadées depuis l'admin et intégrées automatiquement

### 4.2 Fiche technique véhicule (auto-générée depuis les données admin)

> ⚡ **Aucun upload manuel de PDF.** La fiche technique est générée dynamiquement à partir des données saisies dans l'admin pour chaque véhicule.

Contenu généré automatiquement :

```
┌──────────────────────────────────────────────┐
│  [LOGO]     NOM DE LA SOCIÉTÉ                │
├──────────────────────────────────────────────┤
│  FICHE TECHNIQUE — [MARQUE] [MODÈLE] [ANNÉE] │
├──────────────────────────────────────────────┤
│  [PHOTO PRINCIPALE DU VÉHICULE]              │
├──────────────────────────────────────────────┤
│  Kilométrage     | Carburant | Boîte         │
│  Puissance       | Couleur   | Portes        │
│  Places          | CT        | Pays origine  │
├──────────────────────────────────────────────┤
│  DESCRIPTION                                 │
│  [Texte de description complet]              │
├──────────────────────────────────────────────┤
│  ÉQUIPEMENTS & OPTIONS                       │
│  ✓ Climatisation  ✓ GPS  ✓ Caméra recul...   │
├──────────────────────────────────────────────┤
│  Prix : XXX €  │  Contact : [TEL/WHATSAPP]   │
└──────────────────────────────────────────────┘
```

- Généré en temps réel via `jsPDF` au clic sur "Télécharger la fiche technique"
- Toujours à jour avec les dernières informations saisies par l'admin
- Nom de fichier : `FicheTechnique_[Marque]_[Modele]_[Annee].pdf`

### 4.3 Contrat de vente + Facture d'achat (générés depuis l'admin après paiement)

> Générés manuellement par l'admin une fois le paiement client confirmé.

**Contrat de vente :**
```
┌──────────────────────────────────────────────┐
│  [LOGO]     CONTRAT DE VENTE                 │
│  N° [AUTO] — Date : [DATE]                   │
├──────────────────────────────────────────────┤
│  VENDEUR                                     │
│  Société, Adresse, Email, Téléphone          │
│  Représenté par : [NOM RESPONSABLE]          │
├──────────────────────────────────────────────┤
│  ACHETEUR                                    │
│  Nom, Prénom, Adresse, Téléphone, Email      │
├──────────────────────────────────────────────┤
│  DÉSIGNATION DU VÉHICULE                     │
│  Marque | Modèle | Année | Km | Carburant    │
│  Couleur | VIN | CT                          │
├──────────────────────────────────────────────┤
│  CONDITIONS FINANCIÈRES                      │
│  Prix de vente : XXX €                       │
│  Mode de règlement : comptant / fractionné   │
│  Acompte versé : XXX €                       │
│  Solde restant : XXX €                       │
├──────────────────────────────────────────────┤
│  Clauses contractuelles (configurables)      │
├──────────────────────────────────────────────┤
│  Fait à [VILLE], le [DATE]                   │
│  Signature acheteur :  [CACHET + SIGNATURE]  │
└──────────────────────────────────────────────┘
```

**Facture d'achat :**
- Numéro de facture auto-généré
- Détail du véhicule + prix TTC
- RIB de l'entreprise
- Cachet + signature du responsable

**Gestion signature & cachet :**
- L'admin upload depuis les paramètres :
  - Une image de **signature** (PNG transparent recommandé)
  - Un **cachet/tampon** de l'entreprise (PNG transparent)
- Ces images sont stockées sur Cloudinary et intégrées automatiquement dans tous les documents générés

---

## 5. APPLICATION ADMIN (BACK-OFFICE)

> 🎨 **Design inspiré du tableau de bord WordPress** : sidebar sombre à gauche, contenu principal blanc, typographie claire, notifications en haut à droite, profil admin, widgets de statistiques.

**URL d'accès :** `/admin`  
**Protection :** Firebase Auth — email + mot de passe  
**Session :** Persistante

### 5.1 Page de connexion Admin

- Design sobre et professionnel (inspiré de WordPress login)
- Logo de la société centré
- Champs : Email + Mot de passe
- Bouton "Connexion"
- Lien "Mot de passe oublié"

### 5.2 Dashboard

Widgets en haut de page :
- Total véhicules disponibles / vendus
- Total commandes (mois en cours vs précédent)
- Revenus estimés (somme des commandes confirmées)
- Clients inscrits

Tableau des dernières commandes (5 dernières) avec statuts colorés.

Accès rapide : Ajouter un véhicule · Voir les commandes · Gérer les bannières · Paramètres

### 5.3 Gestion des véhicules

#### Ajout / Modification d'un véhicule

Formulaire complet avec :
- Marque (sélection depuis catégories existantes + saisie libre)
- Modèle, Année
- Prix public (barré) + Prix de vente
- Kilométrage, Carburant, Boîte, Puissance, Couleur, Portes, Places
- Pays d'origine, CT (oui/non + date)
- Description (éditeur de texte riche — `React Quill` ou `TipTap`)
- Équipements / options (cases à cocher)
- Photos multiples (upload Cloudinary, réordonnables par drag & drop)
- *(Pas de PDF à uploader — la fiche technique est auto-générée)*
- Mise en avant (oui/non)
- Statut : **Disponible** / **Vendu**

#### Liste des véhicules

- Tableau avec vignette, nom, prix, statut, date d'ajout
- Toggle **"VENDU"** en un clic
- Boutons : Modifier · Supprimer (avec confirmation modale)
- Filtres : par marque, statut, mise en avant
- Recherche rapide

### 5.4 Gestion des catégories

- Ajout d'une nouvelle catégorie à tout moment : nom + image
- Modification du nom et de l'image d'une catégorie existante
- Suppression d'une catégorie (avec confirmation)
- Réorganisation de l'ordre d'affichage par drag & drop

### 5.5 Gestion des commandes

- Tableau de toutes les commandes (pagination)
- Détail complet : infos client + véhicule + mode de paiement
- Changement de statut : `En attente` · `Confirmée` · `Livrée` · `Annulée`
- Téléchargement du bon de commande PDF
- **Générer le contrat de vente** (bouton dédié, disponible après confirmation)
- **Générer la facture d'achat** (bouton dédié, disponible après confirmation)
- Export CSV de toutes les commandes

### 5.6 Gestion des clients

- Liste de tous les clients inscrits (nom, email, date inscription, statut)
- Voir le détail d'un client : ses commandes, ses infos
- **Bloquer / Débloquer un compte client** (toggle) :
  - Un client bloqué ne peut plus se connecter ni passer commande
  - Message d'erreur explicite affiché lors de la tentative de connexion
- Suppression d'un compte client

### 5.7 Gestion des promotions

- **Promotion globale** : appliquer X% de réduction sur TOUS les véhicules disponibles
- **Promotion sélective** : choisir un ou plusieurs véhicules spécifiques
- **Taux disponibles** : 10% · 20% · 30% *(saisie libre possible)*
- **Activation / désactivation** en un clic (effet immédiat sur le site)
- Possibilité de définir une **date de fin** (expiration automatique)
- Dès activation :
  - Prix réduit calculé et affiché automatiquement sur les fiches et le catalogue
  - Badge `PROMO -X%` ajouté sur les vignettes et fiches produits
  - Prix original barré visible

### 5.8 Paramètres généraux

#### Identité de la société
- Upload du **logo** (Cloudinary) → mise à jour instantanée sur tout le site
- **Nom de la société**
- **Adresse complète**
- **Email de contact**
- **Téléphone**

#### Liens & Réseaux sociaux
- **Numéro WhatsApp** (format `+49178XXXX`) — utilisé dans tous les liens wa.me
- **Lien WhatsApp personnalisé** (message pré-rempli)
- **Lien Facebook** (URL de la page)
- *(S'appliquent simultanément : header, footer, chaque fiche produit)*

#### Coordonnées bancaires (RIB)
- Titulaire, IBAN, BIC/SWIFT, Banque, Référence de virement
- Affichés automatiquement sur tous les bons de commande

#### Signature & Cachet du responsable
- Upload de la **signature** (PNG transparent)
- Upload du **cachet/tampon** (PNG transparent)
- Utilisés automatiquement dans tous les documents générés (bon de commande, contrat, facture)
- **Nom du responsable des ventes** (affiché dans les documents)

#### Paiement en plusieurs fois
- Activation / désactivation globale
- Configuration des plans :
  - Nombre de mensualités
  - Taux d'intérêt (0% = sans frais)
  - Acompte minimum requis

#### Gestion des bannières (carousel hero)
- Ajout : image (Cloudinary), titre, sous-titre, texte CTA, lien CTA
- Réorganisation par drag & drop
- Activation / désactivation par bannière
- Suppression

---

## 6. SYSTÈME DE PARTAGE MULTI-CANAL

Sur chaque fiche véhicule, un bouton "Partager" ouvre un menu :

| Canal | Comportement |
|---|---|
| 📱 WhatsApp | `https://wa.me/?text=Bonjour ! Regarde ce véhicule : [URL encodée]` |
| 📧 Email | `mailto:?subject=Véhicule intéressant&body=[URL encodée]` |
| 📘 Facebook / Meta | `https://www.facebook.com/sharer/sharer.php?u=[URL encodée]` |
| 🔗 Copier le lien | Copie l'URL dans le presse-papier (toast de confirmation) |

---

## 7. DESIGN & UX

### 7.1 Charte graphique

- **Style** : Premium, moderne, automobile de luxe
- **Palette** : Noir profond `#0D0D0D` · Blanc `#FFFFFF` · Accent or `#C9A84C` · Rouge vif `#E63946`
- **Typographie** : `Inter` (corps) · `Montserrat` (titres)
- **Animations** : transitions fluides, hover effects élégants, badge animés

### 7.2 Interface Admin

- Inspirée de **WordPress Admin** :
  - Sidebar sombre fixe à gauche (logo en haut + items de menu avec icônes)
  - Zone de contenu principale blanche
  - Barre du haut : titre de page + notifications + avatar admin
  - Cards de statistiques sur le dashboard
  - Tables stylisées avec actions inline
  - Modales de confirmation pour les suppressions
- Palette admin : sidebar `#1D2327` (gris WordPress) · accents bleu `#2271B1`

### 7.3 Responsive Design

- **Mobile-first**
- Breakpoints : 375px / 768px / 1280px / 1920px
- Navigation mobile : burger menu drawer
- Galerie photos : swipe sur mobile
- Admin : sidebar collapsible sur tablette/mobile

### 7.4 Composants UI notables

- Cards véhicule avec hover subtil (élévation ombre)
- Skeleton loading sur toutes les listes
- Filtres de catalogue sticky et collapsibles sur mobile
- Badge dynamiques (VENDU, PROMO, Coup de cœur)
- Toast notifications (succès, erreur, info)
- Modales de confirmation
- Drag & drop (réorganisation photos, bannières, catégories)
- Sélecteur de langue avec drapeaux

---

## 8. SÉCURITÉ

- Routes admin protégées : redirection vers `/admin/login` si non authentifié
- Firebase Auth gère les sessions sécurisées
- Règles Firestore :
  - Lecture publique : `vehicles`, `categories`, `banners`, `settings`
  - Écriture : uniquement admin authentifié
  - Clients : lecture/écriture de leur propre document uniquement
- Cloudinary : uploads signés (signed upload preset depuis le serveur)
- Variables d'environnement `.env` pour toutes les clés (non committées sur Git)
- Comptes clients bloqués : vérification du statut `blocked` au login et à chaque requête Firestore

---

## 9. DÉPLOIEMENT VERCEL

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "env": {
    "VITE_FIREBASE_API_KEY": "@firebase_api_key",
    "VITE_FIREBASE_AUTH_DOMAIN": "@firebase_auth_domain",
    "VITE_FIREBASE_PROJECT_ID": "@firebase_project_id",
    "VITE_CLOUDINARY_CLOUD_NAME": "@cloudinary_cloud_name",
    "VITE_CLOUDINARY_UPLOAD_PRESET": "@cloudinary_upload_preset",
    "SMTP_HOST": "@smtp_host",
    "SMTP_PORT": "@smtp_port",
    "SMTP_USER": "@smtp_user",
    "SMTP_PASS": "@smtp_pass"
  }
}
```

- Push `main` → déploiement automatique en production
- Preview deployments sur Pull Requests
- Domaine custom configurable dans le dashboard Vercel

---

## 10. DÉPENDANCES PRINCIPALES

| Package | Usage |
|---|---|
| `react` 18 + `vite` | Framework + bundler |
| `react-router-dom` v6 | Routing SPA |
| `firebase` | Firestore + Auth |
| `cloudinary` / upload direct | Stockage images et PDF |
| `i18next` + `react-i18next` | Internationalisation (8 langues) |
| `tailwindcss` | Styling |
| `zustand` | État global |
| `react-hook-form` + `zod` | Formulaires + validation |
| `jspdf` + `html2canvas` | Génération PDF (bon de commande, fiche technique, contrat, facture) |
| `@dnd-kit/core` + `@dnd-kit/sortable` | Drag & drop (photos, bannières, catégories) |
| `swiper` | Carousel bannières + galerie photos |
| `@tiptap/react` ou `react-quill` | Éditeur texte riche (description véhicule) |
| `nodemailer` | Envoi emails (confirmation commande) via API Serverless |
| `date-fns` | Formatage dates |
| `react-hot-toast` | Notifications toast |
| `lucide-react` | Icônes |
| `react-image-lightbox` | Mode plein écran galerie photos |

---

## 11. ROADMAP DE DÉVELOPPEMENT

### Phase 1 — Infrastructure (Semaine 1-2)
- Init Vite + React + Tailwind
- Config Firebase (Firestore, Auth, rules)
- Config Cloudinary (upload preset)
- Routing client + admin
- Auth admin (login + protection routes)
- Système i18n — 8 langues

### Phase 2 — App Admin (Semaine 3-4)
- Dashboard avec statistiques
- CRUD véhicules complet (formulaire, upload Cloudinary, drag & drop photos)
- Gestion catégories (ajout/suppression/réorganisation)
- Gestion bannières
- Gestion des promotions (globales + sélectives)
- Paramètres : logo, nom, adresse, RIB, WhatsApp, Facebook, signature, cachet
- Gestion clients (liste + blocage)
- Gestion commandes + export CSV

### Phase 3 — App Client (Semaine 5-6)
- Page d'accueil (carousel + catégories + offres)
- Catalogue + filtres
- Fiche véhicule (galerie, infos, badges promo/vendu, actions)
- Génération fiche technique PDF auto
- Partage multi-canal (WhatsApp, Email, Facebook, Copier lien)
- Formulaire de commande + génération bon de commande PDF
- Espace client (connexion, historique commandes)

### Phase 4 — Documents & Finitions (Semaine 7-8)
- Génération contrat de vente + facture depuis l'admin
- Intégration signature + cachet dans tous les PDFs
- Responsive design complet
- Optimisations performances (lazy loading, code splitting, Cloudinary transforms)
- Tests multi-langues (8 langues)
- Déploiement Vercel + configuration domaine
- Tests utilisateurs + corrections

---

## 12. LIVRABLES

- [ ] Code source sur GitHub (monorepo unique)
- [ ] Application déployée sur Vercel avec domaine
- [ ] Configuration Firebase (Firestore rules + index)
- [ ] Configuration Cloudinary (upload presets)
- [ ] Fichiers de traduction complets (8 langues : fr/en/de/pt/es/it/ro/nl)
- [ ] Guide administrateur (PDF — comment gérer le site)

---

*Document rédigé le 27 Février 2026 — Version 2.0*  
*Inspiré de auto-importde.com — Stack : React 18 + Vite · Tailwind CSS · Firebase Spark · Cloudinary · Vercel*