# Logging Down Under
A web application which allows administrators to invite client contacts to login and download their hole data.

Install things

```
npm install
bower install
```

Start server

```
npm start
```

Setup database. *WARNING: this will empty your entire database*

```
make db
```

Build client javascript

```
make build
```

Development (watch source. restarts server and rebuilds client)

```
make dev
```

Open in browser

```
http://localhost:8000
```

Test S3 locally

```
heroku local
```

Deploy

```
make deploy
```



## Routes

- `/` is the public static home
- `/client` renders the client. requires client authentication
    - `/client/holes` lists client's holes (JSON)
    - `/client/holes/:id` lists hole's files (JSON)
- `/admin` renders the admin. requires admin authentication
- `/api` REST resources (JSON). requires admin authentication. supports filtering, searching, sorting and pagination. [See the epilogue docs for usage](https://github.com/dchester/epilogue#rest-api).

## Assumptions

- No restrictions are placed on authed administrators. For this reason, periodic database backups should be performed.
