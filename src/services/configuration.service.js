class ConfigurationService {
    constructor(config, environment) {
        this.config = config;
        this.environment = environment;
    }

    loadConfiguration() {
        return {
            ...this.config,
            ...this.environment
        };
    }
}

module.exports = ConfigurationService;