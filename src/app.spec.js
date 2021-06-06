const { init } = require('./app');
const supertest = require('supertest');

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
    let request;

    beforeAll(() => {
        request = supertest(init().app)
    });

    it('should provide health endpoint', (done) => {
        request.get('/health')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(STATUS_CODE_OK)
            .end((err) => jasminify(err, done));
    });

});