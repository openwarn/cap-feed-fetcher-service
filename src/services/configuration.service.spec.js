const ConfigurationService = require('./configuration.service');

describe("configuration service", function () {

    it("should merge defaults and environment variables", function () {
        const defaults = {
            default: "some default value"
        };
        const environment = {
            ENVIRONMENT_VAR: "some env value"
        };
        const configurationService = new ConfigurationService(
            defaults, 
            environment
        );
        const config = configurationService.loadConfiguration();

        expect(config.ENVIRONMENT_VAR).toBe("some env value");
        expect(config.default).toBe("some default value");
    });


    it("should prefer environment variables", function () {
        const defaults = {
            SOME_KEY: "some default value"
        };
        const environment = {
            SOME_KEY: "some env value"
        };
        const configurationService = new ConfigurationService(
            defaults, 
            environment
        );
        const config = configurationService.loadConfiguration();

        expect(config.SOME_KEY).toBe("some env value");
    });    
});  