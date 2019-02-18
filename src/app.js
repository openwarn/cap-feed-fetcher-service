
const express = require('express');
const http = require('http');
const ioredis = require('ioredis');
const request = require('request-promise-native');
const requestLogger = require('morgan');

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

function buildConfig(defaultConfig, env) {
  const configurationService = new ConfigurationService(defaultConfig, env);

  return configurationService.loadConfiguration();
}

function startApp() {
  const config = buildConfig(defaults, environment);
  const capDeliveryService = new CapDeliveryService(request, config);
  const capFeedListenerService = new CapAtomFeedListenerService(request, config);
  const redisClient = new ioredis({
    host: config.REDIS_HOST,
    lazyConnect: true
  });
  const capStorageService = new CapStorageService(redisClient);
  const feedFetcherService = new FeedFetcherService(config, redisClient, capFeedListenerService, capStorageService, capDeliveryService);

  const app = express();
  const server = http.Server(app);

  feedFetcherService.fetch()
  .subscribe(
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