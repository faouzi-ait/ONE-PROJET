# Docker

## Setup

Install Docker first

```
cp .env{.sample,}
```

## Usage 

```
docker-compose up
# runs application, set CLIENT in .env

docker-compose run app npm run test:staging --CLIENT demo
```
