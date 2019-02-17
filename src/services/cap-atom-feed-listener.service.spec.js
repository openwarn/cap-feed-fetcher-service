const CapAtomFeedListenerService = require('./cap-atom-feed-listener.service');
const fs = require('fs');

class RequestMock {
    constructor() {
        this.result = '';
    }

    getShouldDeliverPromiseWith(result) {
        this.result = result;
    }

    get(url) {
        return new Promise((resolve) => {
            if (url === 'http://example.org/alert') {
                resolve(fs.readFileSync('src/resources/test/alert.cap.xml', {encoding: 'utf-8'}));
            }

            resolve(this.result);
        });
    }
}

describe('CapAtomFeedListenerService', () => {
    let service;
    let request;

    beforeEach(() => {
        const config = {
            PULL_INTERVAL: 3000
        };
        request = new RequestMock();
        service = new CapAtomFeedListenerService(request, config);
    });

    it('should be created', () => {
        expect(service).toBeDefined();
    });

    it('should only one item at a time', (done) => {
        const xml = fs.readFileSync('src/resources/test/cap-feed.atom.xml', {encoding: 'utf-8'});
        request.getShouldDeliverPromiseWith(xml);
        const feed = service.feed('https://some-url');
        feed.subscribe(
            (item) => {
                expect(Array.isArray(item)).toBe(false);
                done();
            }
        );
    });


});