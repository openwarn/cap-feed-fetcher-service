const from = require('rxjs').from;

class CapStorageService {
    static get REDIS_ID_COLLECTION() {
        return 'cap_ids';
    }

    /**
     * @param {IORedis.Redis} redisClient 
     */
    constructor(redisClient) {
        this.redisClient = redisClient;
    }

    /**
     * @param {string} id 
     * @returns {Observable<boolean>}
     */
    idExists(id) {
        return from(
                this.redisClient.sismember(CapStorageService.REDIS_ID_COLLECTION, id).then(
                (result) => result !== 0
            )
        );
    }

    /**
     * @param {string} id 
     * @returns {Observable<void>}
     */
    addId(id) {
        return from(this.redisClient.sadd(CapStorageService.REDIS_ID_COLLECTION, id))
    }
}

module.exports = CapStorageService;