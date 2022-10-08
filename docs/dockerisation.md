---
id: dockerisation
title: Running backstage through docker
sidebar_label: Dockerisation
description: How to split the app's packages into their own docker containers
---
## Introduction
By default, a backstage scaffolded application comes packed with 2 packages: `app (frontend)` and `backend`, glued together into 1 mono-repo app.
The goal with this documentation (tutorial), is to split in the end each workspace into its own `Docker container` and run the application thorugh docker. Thus in the end we will raise 3 containers:  
- backstage_frontend
- backstage
- postgres

## Prerequisites
You will need the following:  
- `Docker` and `Docker Compose` installed and running on your local machine.
- `NodeJS` installed on your local machine.
- `Yarn` package manager installed

## Step1 - Download a backstage application
```shell
npx @backstage/create-app
```
It will bring a new scaffolded backstage app locally on your machine. If you'll check the packages folder you will see:
```bash
» ls -al packages
total 0
drwxr-xr-x   4 myuser  staff  128  9 Jan 19:17 .
drwxr-xr-x  19 myuser  staff  608  9 Jan 22:23 ..
drwxr-xr-x  10 myuser  staff  320  9 Jan 19:40 app
drwxr-xr-x   9 myuser  staff  288  9 Jan 19:50 backend
```
## Step2 - Separate Frontend
1. Delete `packages/backend/src/plugins/app.ts`
2. Remove the following lines from `packages/backend/src/index.ts`:
   ```tsx
   import app from './plugins/app';
   // ...
     const appEnv = useHotMemoize(module, () => createEnv('app'));
   // ...
       .addRouter('', await app(appEnv));
   ```
3. Remove the `@backstage/plugin-app-backend` and the app package dependency
   (e.g. `app`) from `packages/backend/packages.json`. If you don't remove the
   app package dependency the app will still be built and bundled with the
   backend.

Once the `app-backend` is removed from the backend, you can use your favorite
static file serving method for serving the frontend. An example of how to set up
an NGINX image is available in the
[contrib folder in the main repo](https://github.com/backstage/backstage/blob/master/contrib/docker/frontend-with-nginx)

Note that if you're building a separate docker build of the frontend you
probably need to adjust `.dockerignore` appropriately. Most likely by making
sure `packages/app/dist` is not ignored.

## Step3 - Download contrib folder in the main repo
Download docker folder and DockerFile.hostbuild from [here] (https://github.com/backstage/backstage/blob/master/contrib/docker/frontend-with-nginx)
Create a `.dockerignore` file
```text
.git
.yarn/cache
.yarn/install-state.gz
!packages/app/dist
node_modules
packages/*/src
packages/*/node_modules
*.local.yaml
```

## Step4 - Create backstage-frontend image
After downloading the utiliy files run:
```shell
yarn install
yarn tsc
yarn workspace app build --config ../../app.config.yaml
```
and then create a `Docker image`

```shell
docker build -t backstage-frontend -f Dockerfile.hostbuild .
```

## Step5 - Create the backstage (backend) image
For this, we already have a `Dockerfile` in `packages/backend` folder and we just need to run the build and build-image command

```shell
yarn workspace backend build
yarn workspace backend build-image
```

#### !Important
If we'll try now to run the newly created `backstage` image, things will fail because the Backstage backend cannot connect to port `5432`. Backstage needs to connect to the database in order to store catalog items and other data. It expects to find PostgreSQL running on port 5432. When it can’t, it fails and bails out.

To fix this, will use Docker Compose to make PostgreSQL available.

## Step6 - Get postgres image
```shell
docker pull postgres
```

## Step7 - Add docker-compose.yaml
Add `docker-compose.yaml` file to the root folder of the backstage app
```yaml
version: '3.8'
services:
  backstage:
    image: backstage
    environment:
      # This value must match the name of the postgres configuration block.
      POSTGRES_PORT: ${POSTGRES_PORT}
      POSTGRES_HOST: db
      POSTGRES_USER:  ${POSTGRES_USER}  # should be `postgres` for now; we don't have any users
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      GITHUB_TOKEN: ${GITHUB_TOKEN}
      SONARQUBE_TOKEN: ${SONARQUBE_TOKEN}
      GITHUB_BKSTG_CLIENT_ID: ${GITHUB_BKSTG_CLIENT_ID}
      GITHUB_BKSTG_CLIENT_SECRET: ${GITHUB_BKSTG_CLIENT_SECRET}
    ports:
      - "7007:7007"

  db:
    image: postgres
    restart: always
    environment:
    # NOT RECOMMENDED for a production environment. Trusts all incomming
    # connections.
      POSTGRES_HOST_AUTH_METHOD: trust
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  frontend:
    image: backstage-frontend
    ports:
      - "3000:80"

volumes:
  db-data:
    driver: local
```
#### Note
This is a simple example of `docker-compose.yaml`

#### !Important
A `docker` volume is attached to db instance. This will make the database persistent once the docker containers are deleted.

## Step8 - Putting it all together
Once you’ve done that, you can use Docker Compose to start all these Docker images.

```shell
docker-compose up
```
If everything went ok, you should see your containers working at this step
```shell
> docker ps
CONTAINER ID   IMAGE                COMMAND                  CREATED          STATUS          PORTS                     NAMES
5a66fba19dca   backstage            "docker-entrypoint.s…"   42 minutes ago   Up 42 minutes   0.0.0.0:7007->7007/tcp   bootstrap_backstage_1
9835930afe6d   backstage-frontend   "/docker-entrypoint.…"   42 minutes ago   Up 42 minutes   0.0.0.0:3000->80/tcp     bootstrap_frontend_1
339870c818b2   postgres             "docker-entrypoint.s…"   42 minutes ago   Up 42 minutes   0.0.0.0:5432->5432/tcp   bootstrap_db_1
```

