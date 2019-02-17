const from = require('rxjs').from;

class CapDeliveryService {
    constructor(request, configuration) {
        this.request = request;
        this.configuration = configuration;
    }

    deliver(capXml) {
        return from(this.request({
            headers: {},
            json: {
                xml: capXml
            },
            method: 'POST',
            url: this.configuration.WARNING_DISTRIBUTION_URL
        }));
    }
}

module.exports = CapDeliveryService;