const CapAlert = require('../cap-alert');
const flatMap = require('rxjs/operators').flatMap;
const map = require('rxjs/operators').map;
const forkJoin = require('rxjs').forkJoin;
const from = require('rxjs').from;
const filter = require('rxjs/operators').filter;

class FeedFetcherService {
    /**
     * 
     * @param {CapAtomFeedListenerService} capAtomFeedListenerService 
     * @param {CapStorageService} capStorageService 
     * @param {CapDeliveryService} capDeliveryService 
     */
    constructor(capAtomFeedListenerService, capStorageService, capDeliveryService) {
        this.capAtomFeedListenerService = capAtomFeedListenerService;
        this.capStorageService = capStorageService;
        this.capDeliveryService = capDeliveryService;
    }

    /**
     * Retrieve entries from a feed and transfer new ones to the target service
     * @param {string} feedUrl 
     * @param {number} pullInterval - Number of milliseconds between requests
     * @returns {Observable<alertId>}
     */
    transferNewAlerts(feedUrl, pullInterval) {
        return this.capAtomFeedListenerService.feed(feedUrl, pullInterval).pipe(
            flatMap(
              (alertXml) => {
                const alert = CapAlert.fromXml(alertXml);
                console.info('FeedFetcherService', `Got alert with id ${alert.getId()}`);

                return forkJoin(from([alert.getId()]), from([alertXml]), this.capStorageService.idExists(alert.getId()));
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
              (alertId) => {
                return this.capStorageService.addId(alertId).pipe(
                  map(() => alertId)
                );
              }
            )
          );
    }
}

module.exports = FeedFetcherService;