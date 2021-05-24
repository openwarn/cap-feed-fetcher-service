const { from } = require('rxjs');
const { map } = require('rxjs/operators');

class CapDeliveryService {
    /**
     * @param {AxiosInstance} axios 
     * @param {string} targetUrl 
     */
    constructor(axios, targetUrl) {
        this.axios = axios;
        this.targetUrl = targetUrl;
    }

    /**
     * @param {string} alertId 
     * @param {string} capXml 
     */
    deliver(alertId, capXml) {
        return from(
            this.axios.post(this.targetUrl, {
                xml: capXml
            })
        ).pipe(
            map(
                () => alertId
            )
        );
    }
}

module.exports = CapDeliveryService;