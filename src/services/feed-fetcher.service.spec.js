const FeedFetcherService = require('./feed-fetcher.service');
const CapStorageService = require('./cap-storage.service');
const CapAtomFeedListenerService = require('./cap-atom-feed-listener.service');
const CapDeliveryService = require('./cap-delivery.service');
const { from } = require('rxjs');

describe('FeedFetcherService', () => {
    let capAtomFeedListenerService;
    let capStorageService;
    let capDeliveryService;


    beforeEach(() => {
        capAtomFeedListenerService = new CapAtomFeedListenerService();
        capStorageService = new CapStorageService();
        capDeliveryService = new CapDeliveryService();
    });

    it('should be created', () => {
        const service = new FeedFetcherService(capAtomFeedListenerService, capStorageService, capDeliveryService);
        expect(service).toBeDefined();
    });

    it('should transfer unknown alerts', (done) => {
        const service = new FeedFetcherService(capAtomFeedListenerService, capStorageService, capDeliveryService);
        
        const someNewAlert = `<?xml version="1.0" encoding="UTF-8"?>
        <alert xmlns = "urn:oasis:names:tc:emergency:cap:1.2">
            <identifier>some id</identifier>
        </alert>`;

        spyOn(capAtomFeedListenerService, 'feed').and.returnValue(from([someNewAlert]));
        spyOn(capStorageService, 'idExists').and.returnValue(from([false]));
        spyOn(capStorageService, 'addId').and.returnValue(from([null]));
        spyOn(capDeliveryService, 'deliver').and.callFake((alertId) => from([alertId]));

        service.transferNewAlerts('some valid url', 1).subscribe(
            (id) => {
                expect(capDeliveryService.deliver).toHaveBeenCalled();
                expect(id).toBe('some id');
                done();
            },
            (err) => done.fail(err)
        );
    });

    it('should not transfer known alerts', (done) => {
        const service = new FeedFetcherService(capAtomFeedListenerService, capStorageService, capDeliveryService);
        
        const someNewAlert = `<?xml version="1.0" encoding="UTF-8"?>
        <alert xmlns = "urn:oasis:names:tc:emergency:cap:1.2">
            <identifier>some id</identifier>
        </alert>`;

        const someKnownAlert = `<?xml version="1.0" encoding="UTF-8"?>
        <alert xmlns = "urn:oasis:names:tc:emergency:cap:1.2">
            <identifier>known id</identifier>
        </alert>`;

        spyOn(capAtomFeedListenerService, 'feed').and.returnValue(from([someKnownAlert, someNewAlert]));
        spyOn(capStorageService, 'idExists').and.callFake((id) => {
            if (id === 'known id') return from([true]);

            return from([false]);
        });
        spyOn(capStorageService, 'addId').and.returnValue(from([null]));
        spyOn(capDeliveryService, 'deliver').and.callFake((alertId) => from([alertId]));

        service.transferNewAlerts('some valid url', 1).subscribe(
            (id) => {
                expect(capStorageService.addId).not.toHaveBeenCalledWith('known id');
                expect(capStorageService.addId).toHaveBeenCalledWith('some id');
                expect(id).toBe('some id');
                expect(capDeliveryService.deliver).toHaveBeenCalledTimes(1);
                done();
            },
            (err) => done.fail(err)
        );
    });

});