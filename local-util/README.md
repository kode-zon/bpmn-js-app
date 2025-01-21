Note this to prevent me from forgetting previously used commands.

## See git log 
to see git log graph in pretty format
```
git log --oneline --graph --pretty=format:"%C(yellow)%h %C(blue)%cI %C(cyan)%cn<%ce>%Creset%x09%s"
```

## Push by ignore certificate problem
```
git -c http.sslVerify=false push
```



## Use Docker to implement on restricted machines
### Pull image for target node version
choose node:23.4.0-alpine3.21 because no vulnerabilities report yet at this moment
```
docker pull node:23.4.0-alpine3.21
```


### Build and run node playground docker
```
./local-util/playground-docker.sh do--run-playground-image
```

inside playground container execute command
```
cd /etc/share/project
ng new --no-standalone bpmn-js-app
```