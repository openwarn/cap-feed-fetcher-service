const CapAtomFeedListenerService = require('./cap-atom-feed-listener.service');
const fs = require('fs');
const request = require('request');

describe('CapAtomFeedListenerService', () => {
    let config = {};

    function createRequestMock() {
        return {
            get: (url) => {
                console.error('requestMock', 'this should not have been called, please use a spy instead');
                
                return new Promise((resolve) => resolve('some xml'))
            }
        };
    }


    beforeEach(() => {
        config = {
            PULL_INTERVAL: 3000
        };
    });

    it('should be created', () => {
        const service = new CapAtomFeedListenerService(createRequestMock());
        expect(service).toBeDefined();
    });

    it('should not emit array', (done) => {
        const request = createRequestMock();
        const xml = fs.readFileSync('src/resources/test/cap-feed.atom.xml', {encoding: 'utf-8'});
        spyOn(request, 'get').and.callFake(() => new Promise((resolve) => resolve(xml)));
        const service = new CapAtomFeedListenerService(request, config);
        
        const feed = service.feed('https://some-url', config.PULL_INTERVAL);
        feed.subscribe(
            (item) => {
                expect(Array.isArray(item)).toBe(false);
                done();
            }
        );
    });

    it('should request the right link url from feed item', (done) => {
        const xml = fs.readFileSync('src/resources/test/cap-feed.atom.xml', {encoding: 'utf-8'});
        spyOn(request, 'get').and.callFake((url) => { return new Promise((resolve) => resolve(xml))});
        const service = new CapAtomFeedListenerService(request);
        
        const feed = service.feed('https://some-url', 1);
        feed.subscribe(
            (item) => {
                expect(request.get).toHaveBeenCalledWith('http://example.org/alert');
                done();
            }
        );
    });

});