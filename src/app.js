
const express = require('express');
const http = require('http');
const ioredis = require('ioredis');
const request = require('request-promise-native');
const requestLogger = require('morgan');
const from = require('rxjs').from;
const retry = require('rxjs/operators').retry;
const flatMap = require('rxjs/operators').flatMap;
const catchError = require('rxjs/operators').catchError;
const NoopRedisClient = require('./services/noop-redis.client');

const environment = require('process').env;
// Security
const helmet = require('helmet');
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
  const config = resolveConfig(defaults, environment);
  const capDeliveryService = new CapDeliveryService(request, config.WARNING_DISTRIBUTION_URL);
  const capFeedListenerService = new CapAtomFeedListenerService(request, config);
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
    flatMap(
      () => {
        capStorageService = new CapStorageService(redisClient);
        feedFetcherService = new FeedFetcherService(capFeedListenerService, capStorageService, capDeliveryService);

        return feedFetcherService.transferNewAlerts(config.FEED_URL, config.PULL_INTERVAL);
      }
    )
  ).subscribe(
    () => console.log('App', 'Meldung übertragen'),
    (error) => {
      console.error('App', error);
      throw new Error('Cannot recover from fatal error');
    }
  );

  server.listen(config.PORT, () => {
    console.log('listening on *:' + config.PORT);
  });

  app.use(requestLogger('dev'));
  app.use(helmet());
  app.use(helmet.noCache());
  app.use(cors());

  // Routes
  app.use('/health', healthRouterFactory());

  return app;
}

module.exports = {
  start: startApp
}