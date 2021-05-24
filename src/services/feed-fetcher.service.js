const CapAlert = require('../cap-alert');
const { mergeMap, map, filter, catchError } = require('rxjs/operators');
const { forkJoin, of } = require('rxjs');

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
            mergeMap(
              (alertXml) => {
                const alert = CapAlert.fromXml(alertXml);
                console.info('FeedFetcherService', `Got alert with id ${alert.getId()}`);

                return forkJoin({
                  alertId: of(alert.getId()),
                  alertXml: of(alertXml),
                  isFoundInStorage: this.capStorageService.idExists(alert.getId())
                });
              }
            ),
            filter(
              (params) => {
                return params.isFoundInStorage === false
              }
            ),
            mergeMap(
              (params) => this.capDeliveryService.deliver(params.alertId, params.alertXml)
            ),
            mergeMap(
              (alertId) => {
                console.info(`FeedFetcherService: Saving Id ${alertId} in database`)
                return this.capStorageService.addId(alertId).pipe(
                  map(() => alertId)
                );
              }
            ),
            catchError (
              (error) => {
                console.error('FeedFetcherService: Error occured while transfering message', error);
                return of(null)
              }
            )
          );
    }
}

module.exports = FeedFetcherService;