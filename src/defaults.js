const defaults = {
    FEED_URL: "https://www.dwd.de/DWD/warnungen/cap-feed/de/atom.xml",
    PORT: 9301,
    PULL_INTERVAL: 10000,
    REDIS_HOST: "localhost",
    WARNING_DISTRIBUTION_URL: "http://localhost:9101/api/v1/alerts"
};

module.exports = defaults;