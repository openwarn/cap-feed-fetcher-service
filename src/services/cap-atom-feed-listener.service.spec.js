const CapAtomFeedListenerService = require('./cap-atom-feed-listener.service');
const fs = require('fs');

describe('CapAtomFeedListenerService', () => {
    let config = {};

    function createAxiosMock() {
        return {
            get: (url) => {
                console.error('requestMock', 'this should not have been called, please use a spy instead');
                
                return new Promise((resolve) => resolve({ data: 'some xml' }))
            }
        };
    }


    beforeEach(() => {
        config = {
            PULL_INTERVAL: 3000
        };
    });

    it('should be created', () => {
        const service = new CapAtomFeedListenerService(createAxiosMock());
        expect(service).toBeDefined();
    });

    it('should not emit array', (done) => {
        const axios = createAxiosMock();
        const xml = fs.readFileSync('src/resources/test/cap-feed.atom.xml', {encoding: 'utf-8'});
        spyOn(axios, 'get').and.callFake(
            () => new Promise((resolve) => resolve({ data: xml }))
        );
        const service = new CapAtomFeedListenerService(axios, config);
        
        const feed = service.feed('https://some-url', config.PULL_INTERVAL);
        feed.subscribe(
            (item) => {
                expect(Array.isArray(item)).toBe(false);
                done();
            }
        );
    });

});