#!

do--build-playground-image() {
    docker build \
        -t node:23.4.0-my-playground \
        --progress plain \
        -f Dockerfile.part2
        .
}

do--run-playground-image() {
    docker run --rm -it node:23.4.0-my-playground bash
}


THIS_SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ENTRY_DIR=$(pwd)
ARGS_CNT=$#
echo "ENTRY DIR : $ENTRY_DIR"
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
  
  
fi