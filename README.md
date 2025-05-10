# 🛝 Slides

![build workflow badge](https://github.com/ianyeoh/slides/actions/workflows/docker-publish.yml/badge.svg)

A presentation tool available as a web application, written in React.js as a personal frontend web development learning exercise. See it in action [here](https://slides.ianyeoh.com). 
If prompted to register, feel free to enter a junk email (they aren't validated or used outside of an authentication context). Persisted data in the backend database is wiped periodically daily.

## Run

**Requirements:** [Docker](https://www.docker.com/)

To run as a single-host deployment, download or copy docker.compose.yml from the root of this repository. Then in the same working directory as the Compose file, run: 

```
docker compose up
```

The web application is now running locally at http://localhost on port 80, served from Nginx.
