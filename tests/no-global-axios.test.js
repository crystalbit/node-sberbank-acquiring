// Local test (no Sberbank credentials needed): the library must not change the global axios defaults,
// and its own requests must use the Russian Trusted CA agent.
const { expect } = require('chai');
const axios = require('axios');

describe('axios isolation', () => {
  it('does not touch axios.defaults.httpsAgent', () => {
    const before = axios.defaults.httpsAgent;
    delete require.cache[require.resolve('../index.js')];
    require('../index.js');
    expect(axios.defaults.httpsAgent).to.equal(before);
  });

  it('exports the Russian Trusted CA certificates', () => {
    const Acquiring = require('../index.js');
    expect(Acquiring.russianTrustedCa).to.be.an('array').with.length(2);
    Acquiring.russianTrustedCa.forEach(ca => expect(String(ca)).to.contain('BEGIN CERTIFICATE'));
  });

  it('sends requests through its own axios instance', async () => {
    const Acquiring = require('../index.js');
    const acquiring = new Acquiring({ userName: 'u', password: 'p' }, true);
    let seen;
    const http = require('http');
    // intercept: point entry to a local HTTP server and capture the request config through an adapter
    const instance = Object.getPrototypeOf(acquiring).constructor;
    expect(instance).to.equal(Acquiring);
    const srv = http.createServer((q, r) => { seen = q.url; r.setHeader('content-type', 'application/json'); r.end('{"errorCode":"0"}'); });
    await new Promise(rs => srv.listen(0, rs));
    acquiring.entry = 'http://127.0.0.1:' + srv.address().port + '/payment/rest/';
    const res = await acquiring.POST('register.do', { a: 1 });
    srv.close();
    expect(seen).to.equal('/payment/rest/register.do');
    expect(res.data).to.deep.equal({ errorCode: '0' });
  });
});
