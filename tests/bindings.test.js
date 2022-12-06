const expect = require('chai').expect;
const { credentials } = require('../config');
const { clientId, bindingId } = require('./config');

const Acquiring = require('../index');
const acquiring = new Acquiring(credentials, 'https://google.com', true);

describe('Bindings Test', () => {
  it('get bindings', async () => {
    const result = await acquiring.getBindings(clientId);
    expect(result).to.be.a('object');
    expect(result.bindings).to.be.a('array');
    expect(result.errorMessage).to.be.equal('Успешно');
  });

  it('unbind card', async () => {
    const result = await acquiring.unBindCard(bindingId);
    expect(result).to.be.a('object');
    expect(result.errorMessage).to.be.equal('Успешно');
  });
});
