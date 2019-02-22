const interval = require('rxjs').interval;
const flatMap = require('rxjs/operators').flatMap;
const map = require('rxjs/operators').map;
const mergeAll = require('rxjs/operators').mergeAll;
const from = require('rxjs').from;
const xmljsConverter = require('xml-js');

class CapAtomFeedListenerService {    
    
    /**
     * Check whether the converted xml is a atom feed that meets some
     *  special requirements (see CapFeeds)
     * @param {object} feed represented as simple xml-js object
     * @returns {boolean} isValid
     */
    static _isValidAtomFeed(feed) {
        if (!feed) {
            return false;
        }

        if (!feed._attributes) {
            return false;
        }

        if (feed._attributes.xmlns !== 'http://www.w3.org/2005/Atom') {
            return false;
        }

        if (!Array.isArray(feed.entry)) {
            return false;
        }

        // Every entry should have a array-type link element 
        if (!feed.entry.reduce((acc, entry) => acc && Array.isArray(entry.link), true)) {
            return false;
        }

        return true;
    }

    constructor(request) {
        this.request = request;
    }

    /**
     * Creates an observable which emits cap xml items 
     * from an atom feed by checking the feed endpoint regulary
     * @param {string} url - URL to an cap-compatible atom feed
     * @param {number} pullInterval - Number of milliseconds between requests
     * @returns {Observable<string>} observableFeed
     */
    feed(url, pullInterval) {
        return interval(pullInterval)
        .pipe(
            flatMap(
                () => from(this.request.get(url))
            ),
            map(
                (feedXml) => {
                    const xmlAsObj = xmljsConverter.xml2js(feedXml, {
                        alwaysArray: true,
                        compact: true
                    });

                    const feed = xmlAsObj.feed[0];
                    if (!CapAtomFeedListenerService._isValidAtomFeed(feed)) {
                        throw new Error('invalid atom feed xml')
                    }

                    return feed.entry.map(
                        (entry) => {
                            // Filter links to ensure right type, but tolerate links without type
                            entry.link = entry.link.filter(
                                (link) => !link._attributes.type || link._attributes.type === 'application/cap+xml'
                            );
                            
                            return entry.link[0]._attributes.href;
                        }
                    );
                }
            ),
            map(
                (capLinks) => capLinks.map(
                    (capUrl) => from(this.request.get(capUrl))
                )
            ),
            mergeAll(),
            flatMap(
                (item) => item
            )
        );
    }

}

module.exports = CapAtomFeedListenerService;