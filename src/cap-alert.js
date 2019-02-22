const xmljsConverter = require('xml-js');

class CapAlert {
    static fromXml(xml) {
        return new CapAlert(xml);
    }

    /**
     * @param {string} xml 
     */
    constructor(xml) {
        this.alert = xmljsConverter.xml2js(xml, {
            compact: true
        }).alert;
    }

    /**
     * @returns {string}
     */
    getId() {
        return this.alert.identifier._text;
    }
}

module.exports = CapAlert;