nginx is dockerised, just have to run `docker compose up --build` as usual.

if edits are made to the local nginx.conf file, following command must be run to see changes reflected in docker:

`docker exec cs3219-ay2425s1-project-g14-nginx-1  nginx -s reload`

(or just exec `nginx -s reload` in the container directly)
