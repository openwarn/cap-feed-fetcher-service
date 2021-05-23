
const express = require('express');
const http = require('http');
const ioredis = require('ioredis');
const axios = require('axios').default;
const requestLogger = require('morgan');
const { from } = require('rxjs');
const { catchError, mergeMap, retry } = require('rxjs/operators');
const NoopRedisClient = require('./services/noop-redis.client');

// Security
const helmet = require('helmet');
const noCache = require('nocache');
const cors = require('cors');

// Services
const ConfigurationService = require('./services/configuration.service');
const CapAtomFeedListenerService = require('./services/cap-atom-feed-listener.service');
const CapStorageService = require('./services/cap-storage.service');
const FeedFetcherService = require('./services/feed-fetcher.service');
const CapDeliveryService = require('./services/cap-delivery.service');

const healthRouterFactory = require('./routes/health');
const defaults = require('./defaults');

function resolveConfig(defaultConfig, env) {
  const configurationService = new ConfigurationService(defaultConfig, env);

  return configurationService.loadConfiguration();
}

function startApp() {
  const config = resolveConfig(defaults, process.env);
  const capDeliveryService = new CapDeliveryService(axios, config.WARNING_DISTRIBUTION_URL);
  const capFeedListenerService = new CapAtomFeedListenerService(axios, config);
  const app = express();
  const server = http.Server(app);

  let redisClient = new ioredis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    lazyConnect: true
  });
  let capStorageService;
  let feedFetcherService;

  from(redisClient.connect()).pipe(
    retry(config.REDIS_CONNECTION_RETRIES),
    catchError(
      () => { 
          // If no connection to redis is available use fake redis client instead
          console.error('FeedFetcherService', 'Cannot establish connection to redis, continuing without storage');
          redisClient = new NoopRedisClient();
          
          return from([null]);
      }
    ),
    mergeMap(
      () => {
        capStorageService = new CapStorageService(redisClient);
        feedFetcherService = new FeedFetcherService(capFeedListenerService, capStorageService, capDeliveryService);

        return feedFetcherService.transferNewAlerts(config.FEED_URL, config.PULL_INTERVAL);
      }
    )
  ).subscribe({
      next: () => console.log('App', 'Message transfered'),
      error: (error) => {
        console.error('App', error);
        throw new Error('Cannot recover from fatal error');
      }
  });

  app.use(requestLogger('dev'));
  app.use(helmet());
  app.use(noCache());
  app.use(cors());

  // Routes
  app.use('/health', healthRouterFactory());

  server.listen(config.PORT, () => {
    console.log('listening on *:' + config.PORT);
  });

  return app;
}

module.exports = {
  start: startApp
}