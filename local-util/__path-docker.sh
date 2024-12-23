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

export MSYS_NO_PATHCONV=1
if [[ $IS_WINDOW=="1" ]]; then
    echo "MACHINE is WINDOW BASE"
    DOCKER_ENTRY_DIR="$(pwd -W)"
else
    echo "MACHINE is LINUX BASE"
    DOCKER_ENTRY_DIR="$PRE_PATH$(pwd)"
fi

echo "DOCKER_ENTRY_DIR : $DOCKER_ENTRY_DIR"