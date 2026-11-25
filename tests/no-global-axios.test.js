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

  it('sends requests through its own axios instance (a global interceptor is not called)', async () => {
    const Acquiring = require('../index.js');
    const http = require('http');
    let globalInterceptorCalls = 0;
    const id = axios.interceptors.request.use((config) => { globalInterceptorCalls += 1; return config; });
    let seen;
    const srv = http.createServer((q, r) => { seen = q.url; r.setHeader('content-type', 'application/json'); r.end('{"errorCode":"0"}'); });
    await new Promise(rs => srv.listen(0, rs));
    try {
      const acquiring = new Acquiring({ userName: 'u', password: 'p' }, 'https://example.com/{order}', true);
      acquiring.entry = 'http://127.0.0.1:' + srv.address().port + '/payment/rest/';
      const res = await acquiring.POST('register.do', { a: 1 });
      expect(seen).to.equal('/payment/rest/register.do');
      expect(res.data).to.deep.equal({ errorCode: '0' });
      expect(globalInterceptorCalls).to.equal(0);
    } finally {
      axios.interceptors.request.eject(id);
      srv.close();
    }
  });

  it('rejects an empty ca and ca combined with httpsAgent', () => {
    const Acquiring = require('../index.js');
    const https = require('https');
    const make = options => () => new Acquiring({ userName: 'u', password: 'p' }, 'https://example.com/{order}', false, options);
    expect(make({ ca: [] })).to.throw(TypeError);
    expect(make({ ca: '' })).to.throw(TypeError);
    expect(make({ ca: ['x'], httpsAgent: new https.Agent() })).to.throw(TypeError);
    expect(make(null)).to.not.throw();
    expect(make({})).to.not.throw();
  });

  it('uses the bundled Russian CAs by default', () => {
    const Acquiring = require('../index.js');
    const a = new Acquiring({ userName: 'u', password: 'p' }, 'https://example.com/{order}');
    expect(a.http.defaults.httpsAgent.options.ca).to.deep.equal(Acquiring.russianTrustedCa);
  });

  it('accepts custom CA certificates (options.ca)', () => {
    const Acquiring = require('../index.js');
    const custom = ['-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----\n'];
    const a = new Acquiring({ userName: 'u', password: 'p' }, 'https://example.com/{order}', false, { ca: custom });
    expect(a.http.defaults.httpsAgent.options.ca).to.equal(custom);
    const b = new Acquiring({ userName: 'u', password: 'p' }, 'https://example.com/{order}');
    expect(b.http.defaults.httpsAgent.options.ca).to.deep.equal(Acquiring.russianTrustedCa); // others unaffected
  });

  it('accepts a custom https agent (options.httpsAgent)', () => {
    const Acquiring = require('../index.js');
    const agent = new (require('https').Agent)({ keepAlive: true });
    const a = new Acquiring({ userName: 'u', password: 'p' }, 'https://example.com/{order}', false, { httpsAgent: agent });
    expect(a.http.defaults.httpsAgent).to.equal(agent);
  });
});
