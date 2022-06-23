# Manage back-end

- Express.js + Mongoose + Passport.js
- CommonJS being migrated to TypeScript

## Environment

Currently using node 16 and npm 8.

## Run development server

```sh
npm install --include=dev
```

```sh
npm build
```

```sh
npm serve
```

Create development user `teemutestaaja`, password `1234567890`.

```sh
curl http://localhost/user/getInitialTeemu
```

Then you can login in using the front-end and create an Api-Key you can use for authenticated requests. (or maybe you can disable authentication :DD)
