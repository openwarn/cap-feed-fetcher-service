const from = require('rxjs').from;
const map = require('rxjs/operators').map;

class CapDeliveryService {
    constructor(request, targetUrl) {
        this.request = request;
        this.targetUrl = targetUrl;
    }

    /**
     * @param {string} alertId 
     * @param {string} capXml 
     */
    deliver(alertId, capXml) {
        return from(this.request({
            headers: {},
            json: {
                xml: capXml
            },
            method: 'POST',
            url: this.targetUrl
        })).pipe(
            map(
                () => alertId
            )
        );
    }
}

module.exports = CapDeliveryService;