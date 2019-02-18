const CapAlert = require('../cap-alert');
const flatMap = require('rxjs/operators').flatMap;
const map = require('rxjs/operators').map;
const forkJoin = require('rxjs').forkJoin;
const from = require('rxjs').from;
const filter = require('rxjs/operators').filter;
const retry = require('rxjs/operators').retry;
const catchError = require('rxjs/operators').catchError;
const NoopRedisClient = require('./noop-redis.client');

class FeedFetcherService {
    constructor(config, redisClient, capFeedListenerService, capStorageService, capDeliveryService) {
        this.config = config;
        this.redisClient = redisClient;
        this.capFeedListenerService = capFeedListenerService;
        this.capStorageService = capStorageService;
        this.capDeliveryService = capDeliveryService;
    }

    fetch() {
        return from(this.redisClient.connect())
        .pipe(
            retry(3),
            catchError(
                () => { 
                    // If no connection to redis is available use fake redis client instead
                    console.warn('FeedFetcherService', 'Cannot establish connection to redis, continuing without storage');
                    this.redisClient = new NoopRedisClient();
                    
                    return from([null]);
                }
            ),
            flatMap(
               () => this.capFeedListenerService.feed(this.config.FEED_URL) 
            ),
            flatMap(
              (alertXml) => {
                const alert = CapAlert.fromXml(alertXml);
                console.info('FeedFetcherService', `Got alert with id ${alert.getId()}`);

                return forkJoin(from([alert.getId()]), from([alertXml]), this.capStorageService.exists(alert.getId()));
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
              (params) => this.capDeliveryService.deliver(params.alertId, params.alertXml)
            ),
            flatMap(
              (alertId) => from(this.capStorageService.add(alertId))
            )
          );
    }
}

module.exports = FeedFetcherService;