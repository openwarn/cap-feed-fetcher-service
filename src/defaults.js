const defaults = {
    FEED_URL: "https://www.dwd.de/DWD/warnungen/cap-feed/de/atom.xml",
    PORT: 9301,
    PULL_INTERVAL: 10000,
    REDIS_HOST: "localhost",
    REDIS_PORT: 6379,
    REDIS_CONNECTION_RETRIES: 3,
    WARNING_DISTRIBUTION_URL: "http://localhost:9101/api/v1/alerts"
};

module.exports = defaults;