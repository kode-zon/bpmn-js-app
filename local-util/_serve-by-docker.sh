#!

THIS_SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source $THIS_SCRIPT_DIR/__path-docker.sh

containerId=$(docker run -d --rm --name nginx-bpmn-js-app \
                        -p 80:80 \
                        -v "$ENTRY_DIR/local-util/nginx-template.conf:/etc/nginx/nginx-template.conf:ro" \
                        -v "$DOCKER_ENTRY_DIR/dist/bpmn-js-app:/usr/share/nginx/html:ro" \
                        nginx:stable-alpine3.20-slim )

echo "container id : $containerId"
docker logs $containerId