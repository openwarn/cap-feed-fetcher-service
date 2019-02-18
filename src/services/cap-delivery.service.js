const from = require('rxjs').from;
const map = require('rxjs/operators').map;

class CapDeliveryService {
    constructor(request, configuration) {
        this.request = request;
        this.configuration = configuration;
    }

    deliver(alertId, capXml) {
        return from(this.request({
            headers: {},
            json: {
                xml: capXml
            },
            method: 'POST',
            url: this.configuration.WARNING_DISTRIBUTION_URL
        })).pipe(
            map(
                () => alertId
            )
        );
    }
}

module.exports = CapDeliveryService;