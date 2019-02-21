# CapFeedFetcherService

CapFeedFetcherService is a component of OpenWarn. It regulary checks a specific [CapFeed](http://docs.oasis-open.org/emergency-adopt/cap-feeds/v1.0/cn02/cap-feeds-v1.0-cn02.html#_Toc382489976) for new items and sends them to a WarningDistributionService.

Currently, only [Atom-Feeds](https://tools.ietf.org/html/rfc4287) are supported. Furthermore, entries must contain a reference to the original alerts formatted as [CAPv1.2](http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html).

Add more feeds by running multiple instances of the service with different configuration.

## About OpenWarn

OpenWarn is a prototypic open-source warning system which leverages modern microservice architecture concepts
to build an modular and customizable integrated warning system.

It was created as part of the master thesis called
`Konzeption einer Softwarearchitektur für ein Nachrichtensystem zur Warnung der Bevölkerung in Gefahrensituationen` (conception of a software architecture for public warning message systems) at Technical University Ilmenau in 2019.

## Installation

Prerequisites: [Node.js](https://nodejs.org/en/) (>=10), npm version 3+.

```bash
npm install
```

### Build Docker Image

```bash
docker build -t cap-feed-fetcher-service .
```

## Run

```bash
docker run -p 9301:9301 --env FEED_URL=`http://example.org/alerts/feed/atom`
```


## Configuration

This service is configurable via environment variables (docker).

* FEED_URL: CAP feed URL (Atom)
* PULL_INTERVAL: Time between HTTP calls to FEED_URL
* REDIS_HOST: IP Address / Host of a redis (database) instance
* WARNING_DISTRIBUTION_URL: Endpoint to where new alerts are being posted (HTTP)

## Contributing

Feel free to contribute to OpenWarn by creating a pull request or adding an issue.

If you are interessted in supporting this project or building a warning system based on this software, contact me via GitHub.

## License

  [MIT](LICENSE)