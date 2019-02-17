const express = require('express');
const process = require('process');
const app = require('./app');
const request = require('supertest');

// Helper function to combine supertest with jasmine
function jasminify(err, done) {
    if (err) {
        done.fail(err)
    } else {
        done(); 
    }
}

describe('app', () => {
    const STATUS_CODE_OK = 200;
    const TEST_PORT = 7001;
    let expressApp = express();

    beforeAll(() => {
        process.env.PORT = TEST_PORT;
        expressApp = app.start();
    });

    it('should provide health endpoint', (done) => {
        request(expressApp).get('/health')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(STATUS_CODE_OK)
            .end((err) => jasminify(err, done));
    });

});