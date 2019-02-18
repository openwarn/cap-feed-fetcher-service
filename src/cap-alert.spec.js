const fs = require('fs');
const CapAlert = require('./cap-alert');

describe('CapAlert', () => {
    it('should extract id from cap xml', () => {
        const cap = fs.readFileSync('src/resources/test/alert.cap.xml', {encoding: 'utf-8'});
        const alert = CapAlert.fromXml(cap);

        expect(alert.getId()).toBe('Example-23342234');

    });
});