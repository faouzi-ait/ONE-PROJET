
## All branches are currently tested using [Circle Ci](https://app.circleci.com/github/rawnet/one-web/pipelines)

The build process takes advantage of Docker images.

## Adding/removing a client

You first need to add all the environment variables to [Circle Ci](https://app.circleci.com/settings/project/github/thisisonetv/one-web/environment-variables)

These are all prepended with the client name:

i.e.
  - [??]_EMAIL_ADDRESS,
  - [??]_PASSWORD,
  - [??]_API_URL,
  - [??]_PERCY_TOKEN,

For Okta users there are also
  - [??]_OKTA_USERNAME
  - [??]_OKTA_PASSWORD

All these secrets are also saved in 1Pass under `Circle CI - config`. You should update this now!!

After all of these have been added, it is now time to update the .circleci/config.yml.

This is done from a node script for easy repition. Find the `clientList` array in ./scripts/circleConfig/generate.js and add/remove clients as needed.

Followed by running `node ./scripts/circleConfig/generate.js`

## Percy Token ( SKIPPING Integration Testing )

If you omit PERCY_TOKEN from the circle ci environment variables, the integration test will pass. (i.e. not run) This is useful for RTV as we have no integration tests run against these lite clients.


## Some usefull Docker Commands

Docker creates three main things on your machine. These are images, containers and volumes.

Images:
  You can view all the images you have on your machine running: `docker images` or `docker image ls`
  These are essentially blueprints for creating containers. You make images with Dockerfile's. See below for more..
  You can remove images using: `docker rmi <image name or id>` If the image is in use add `--force`.

Containers:
  You can view all the containers you have running: `docker ps` add `-a` to see ALL container's, including ones not running.
  These are the running instances of images. Essentially machine environments built from their image instructions.
  You can remove containers using: `docker rm <container name or id>`. The `--force` flag may be required if container is running.

Volumes:
  You can view all the volumes you have running: `docker volumes ls` to view only un-used volumes. add `-f dangling=true`.
  Volumes are 'allocated space' for containers. Namely, when we load our node_modules into a container, they are stored in a volume.
  Un-used Volumes mean the container that used that space has been removed, but the volume still exists.
  You can remove volumes using: `docker volume rm <volume id>`

All of the above remove commands for images/containers/volumes can be run on more than one id/name at once by adding a space between them.
e.g. `docker rm 6caf36c70d1b 9b590fa894be` This would remove both containers.

Other helpfull commands:
Remove all containers : `docker rm $(docker ps -a -q)`
Remove all volumes : `docker volume rm $(docker volume ls -q)`
Remove all un-used volumes: `docker volume rm $(docker volume ls -f dangling=true -q)`
