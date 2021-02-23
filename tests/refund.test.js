/**
 * Тест возврата заказа:
 * 
 * в тестовом окружении создайте оплаченный заказ (например, https://3dsec.sberbank.ru/mportal3/admin/snp)
 * 
 * перейдите на оплату и оплатите заказ тестовой картой на 1000 рублей: https://securepayments.sberbank.ru/wiki/doku.php/test_cards
 * 
 * далее перейдите в заказы https://3dsec.sberbank.ru/mportal3/admin/orders
 * и скопируйте "Уникальный номер заказа в системе" в файл tests/config.js
 * 
 * (см. config.sample.js – сделать так же)
 * 
 * Этот тест должен сделать частичный возврат заказа (500 рублей 23 копейки)
 */

const expect = require('chai').expect;
const { credentials } = require('../config');
const { orderForRefund } = require('./config');

const AMOUNT_TO_REFUND = 500.23;

const Acquiring = require('../index');
const acquiring = new Acquiring(credentials, 'https://google.com', true);

describe('Refund Test', () => {
  it('refund order', async () => {
    const result = await acquiring.refund(orderForRefund, AMOUNT_TO_REFUND);
    expect(typeof result).to.be.equal('object');
    expect(typeof (result.errorCode)).to.be.equal('string');
    expect(result.errorMessage).to.be.equal('Успешно');
  });

  it('check refunded amount', async () => {
    const result = await acquiring.get(orderForRefund);
    expect(result.paymentAmountInfo.refundedAmount / 100).to.be.equal(AMOUNT_TO_REFUND);
  });
});
