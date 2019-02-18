const xmljsConverter = require('xml-js');

class CapAlert {
    static fromXml(xml) {
        return new CapAlert(xml);
    }

    constructor(xml) {
        this.alert = xmljsConverter.xml2js(xml, {
            compact: true
        }).alert;
    }

    getId() {
        return this.alert.identifier._text;
    }
}

module.exports = CapAlert;