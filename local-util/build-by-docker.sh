#!

ENTRY_DIR=$(pwd)

if [ ! -f "$ENTRY_DIR/package.json" ]; then
    echo "This script should be run in the project directory."
    exit 1
fi

PRE_PATH=""
IS_WINDOW=""
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Cygwin;PRE_PATH="/";IS_WINDOW="1";;
    MINGW*)     machine=MinGw;PRE_PATH="/";IS_WINDOW="1";;
    MSYS_NT*)   machine=MSys;;
    *)          machine="UNKNOWN:${unameOut}"
esac
echo "MACHINE :: ${machine}"

MSYS_NO_PATHCONV=1
if [[ $IS_WINDOW=="1" ]]; then
    DOCKER_ENTRY_DIR="$(cmd //c cd)"
else
    DOCKER_ENTRY_DIR="$PRE_PATH$(pwd)"
fi

THIS_SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ENTRY_PROJECT_DIR_NAME=$(basename $ENTRY_DIR)
PROJECT_DIR_NAME=bpmn-js-app
ARGS_CNT=$#
echo "ENTRY DIR : $ENTRY_DIR"
echo "ENTRY DIR (for DOCKER) : $DOCKER_ENTRY_DIR"


docker run --rm \
        -v "$DOCKER_ENTRY_DIR:/etc/share/project/$PROJECT_DIR_NAME:rw" \
        node:23.4.0-alpine3.21 \
        cd /etc/share/project/$PROJECT_DIR_NAME && npm run build