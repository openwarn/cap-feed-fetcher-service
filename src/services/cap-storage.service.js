class CapStorageService {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }

    exists(id) {
        return this.redisClient.exists(id).then(
            (result) => result !== 0
        );
    }

    add(id, capXml) {
        return this.redisClient.set(id, capXml);
    }
}

module.exports = CapStorageService;