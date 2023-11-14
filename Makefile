build:
	./node_modules/.bin/tsc src/client/*.ts --outDir public/js

run:
	npm start

lint:
	npm run lint

db: create-db

create-db:
	npm run reset-database

install:
	npm install

dev:
	npm run dev &
	./node_modules/.bin/tsc src/client/*.ts --outDir public/js -w

deploy:
	git push heroku master

.PHONY: dev
