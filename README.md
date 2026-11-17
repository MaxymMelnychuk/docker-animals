# 🐾 Docker Animals

Application web de gestion d'animaux d'un zoo.  
Permet d'ajouter et consulter des animaux stockés dans une base PostgreSQL.

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Lancer l'application

### 1. Cloner le repo
```bash
git clone https://github.com/TON_PSEUDO/docker-animals.git
cd docker-animals
```

### 2. Créer le `.env`
```bash
cp .env.example .env
```
Ouvre `.env` et remplace `a-remplacer` par un vrai mot de passe.

### 3. Lancer
```bash
docker compose up --build
```

## URLs

| Service | URL |
|---|---|
| Application | http://localhost:3000 |
| Adminer | http://localhost:8080 |

## Se connecter à Adminer

1. Ouvre http://localhost:8080
2. Remplis le formulaire :
   - **Système** : PostgreSQL
   - **Serveur** : `db`
   - **Utilisateur** : valeur de `POSTGRES_USER` dans ton `.env`
   - **Mot de passe** : valeur de `POSTGRES_PASSWORD` dans ton `.env`
   - **Base de données** : valeur de `POSTGRES_DB` dans ton `.env`

## Auteurs

- Prénom Nom 1
- Prénom Nom 2