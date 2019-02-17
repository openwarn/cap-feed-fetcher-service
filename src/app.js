
const express = require('express');
const http = require('http');
const request = require('request-promise-native');
const requestLogger = require('morgan');
const ConfigurationService = require('./services/configuration.service');
const CapAtomFeedListenerService = require('./services/cap-atom-feed-listener.service');
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

  const app = express();
  const server = http.Server(app);

  capFeedListenerService.feed(config.FEED_URL).subscribe(
    (alertXml) => {
      console.log('alertXML arrived', alertXml.length);
      capDeliveryService.deliver(alertXml)
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