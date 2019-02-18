
const express = require('express');
const http = require('http');
const ioredis = require('ioredis');
const request = require('request-promise-native');
const requestLogger = require('morgan');
const flatMap = require('rxjs/operators').flatMap;
const map = require('rxjs/operators').map;
const forkJoin = require('rxjs').forkJoin;
const from = require('rxjs').from;
const filter = require('rxjs/operators').filter;
const ConfigurationService = require('./services/configuration.service');
const CapAtomFeedListenerService = require('./services/cap-atom-feed-listener.service');
const CapStorageService = require('./services/cap-storage.service');
const CapAlert = require('./cap-alert');
const environment = require('process').env;
// Security
const helmet = require('helmet');
const cors = require('cors');

// Services
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
  const app = express();
  const server = http.Server(app);

  from(redisClient.connect()).pipe(
    flatMap(
       () => capFeedListenerService.feed(config.FEED_URL) 
    ),
    flatMap(
      (alertXml) => {
        const alert = CapAlert.fromXml(alertXml);

        return forkJoin(from([alert.getId()]), from([alertXml]), capStorageService.exists(alert.getId()));
      }
    ),
    map(
      (params) => ({
        alertId: params[0],
        alertXml: params[1],
        isFoundInStorage: params[2]
      })
    ),
    filter(
      (params) => params.isFoundInStorage === false
    ),
    flatMap(
      (params) => capDeliveryService.deliver(params.alertId, params.alertXml)
    ),
    flatMap(
      (alertId) => from(capStorageService.add(alertId))
    )
  )
  .subscribe(
    () => console.log('App', 'Meldung übertragen'),
    (error) => {
      console.error('App', error);
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