class NoopRedisClient {
    exists(id) {
        return new Promise((resolve) => resolve('0'));
    }

    add(id, capXml) {
        return new Promise((resolve) => resolve());
    }
}

module.exports = NoopRedisClient;