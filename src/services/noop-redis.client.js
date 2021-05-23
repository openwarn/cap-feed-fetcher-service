class NoopRedisClient {
    exists(_id) {
        return new Promise((resolve) => resolve('0'));
    }

    add(_id, _capXml) {
        return new Promise((resolve) => resolve());
    }
}

module.exports = NoopRedisClient;