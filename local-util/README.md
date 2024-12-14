Note this to prevent me from forgetting previously used commands.

## See git log 
to see git log graph in pretty format
```
git log --oneline --graph --pretty=format:"%C(yellow)%h %C(blue)%cI %C(cyan)%cn<%ce>%Creset%x09%s"
```



## Use Docker to implement on restricted machines
### Pull imagee for target node version
choose node:23.4.0-alpine3.21 because no vulnerabilities report yet at this moment
```
docker pull node:23.4.0-alpine3.21
```