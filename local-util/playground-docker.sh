#!

do--build-playground-image() {
    echo "THIS_SCRIPT_DIR : $THIS_SCRIPT_DIR"
    docker build \
        --progress plain \
        -t $DOCKER_PLAYGROUND_TAG \
        -f $THIS_SCRIPT_DIR/Dockerfile.node23-alpine.bash \
        .
}

do--run-playground-image() {

    ENTRY_PROJECT_DIR_NAME=$(basename $DOCKER_ENTRY_DIR)
    echo "DOCKER_ENTRY_DIR : $DOCKER_ENTRY_DIR"
    echo "ENTRY_PROJECT_DIR_NAME : $ENTRY_PROJECT_DIR_NAME"
    echo "PROJECT_DIR_NAME : $PROJECT_DIR_NAME"


    # docker_id=$(docker run --name node-playground -d \
    #     -v "$DOCKER_ENTRY_DIR:/etc/share/project/$PROJECT_DIR_NAME:rw" \
    #     $DOCKER_PLAYGROUND_TAG \
    #     bash -c "while true; do echo 'loop'; sleep 2; done")

    # docker exec -it node-playground bash

    # docker rm "$docker_id"

    DOCKER_PLAYGROUND_IMG_ID=$(docker images -q $DOCKER_PLAYGROUND_TAG 2> /dev/null)
    if [ ! -z "$DOCKER_PLAYGROUND_IMG_ID" ]; then
      echo "image '$DOCKER_PLAYGROUND_TAG' is exist."
    else 
      echo "image '$DOCKER_PLAYGROUND_TAG' doesn't exist yet, create..."
      do--build-playground-image
    fi

    docker run --rm -it \
        -p 4200:4200 \
        -v "$DOCKER_ENTRY_DIR:/etc/share/project/$PROJECT_DIR_NAME:rw" \
        $DOCKER_PLAYGROUND_TAG \
        bash
}



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

DOCKER_PLAYGROUND_TAG=node:23.4.0-my-playground
MSYS_NO_PATHCONV=1
if [[ $IS_WINDOW=="1" ]]; then
    DOCKER_ENTRY_DIR="$(cmd //c cd)"
else
    DOCKER_ENTRY_DIR="$PRE_PATH$(pwd)"
fi

THIS_SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ENTRY_DIR=$(pwd)
ENTRY_PROJECT_DIR_NAME=$(basename $ENTRY_DIR)
PROJECT_DIR_NAME=bpmn-js-app
ARGS_CNT=$#
echo "ENTRY DIR : $ENTRY_DIR"
echo "ENTRY DIR (for DOCKER) : $DOCKER_ENTRY_DIR"

echo "ARGS_CNT : $ARGS_CNT"
if [ "$ARGS_CNT" -gt 0 ]; then
  eval $@;
else
  printf "\033[31;22mplease specify \033[33;22m<method-to-call>\033[0m\033[31;22m for execute \033[0m\n"
  printf "example ::: \033[36;22m$0 \033[33;22m<method-to-call>\033[0m\n"
  echo "possible value of <method-to-call> are list as below : "
  fnArr=$(declare -F | cut -d" " -f 3-)
  for fnName in $fnArr; do
    printf "  \033[33;22m$fnName\033[0m\n"
  done
  exit 128
fi