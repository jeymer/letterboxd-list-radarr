# builds and pushes a new version of the image to dockerhub
docker buildx build --platform linux/amd64,linux/arm64 --push -t jeymer/letterboxd-list-radarr:`cat package.json | jq -r '.version'` -t jeymer/letterboxd-list-radarr:latest .