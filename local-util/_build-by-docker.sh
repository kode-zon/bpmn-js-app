#!

THIS_SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
. $THIS_SCRIPT_DIR/__path-docker.sh

ENTRY_PROJECT_DIR_NAME=$(basename $ENTRY_DIR)
PROJECT_DIR_NAME=bpmn-js-app
ARGS_CNT=$#
echo "ENTRY DIR : $ENTRY_DIR"
echo "ENTRY DIR (for DOCKER) : $DOCKER_ENTRY_DIR"


docker run --rm \
        -v "$DOCKER_ENTRY_DIR:/etc/share/project/$PROJECT_DIR_NAME:rw" \
        node:23.4.0-alpine3.21 \
        /bin/sh -c "cd /etc/share/project/$PROJECT_DIR_NAME 
                apk add --no-cache bash && 
                apk add --no-cache openssl && 
                apk add --no-cache envsubst && 
                npm i -g @angular/cli && 
                npm run build"