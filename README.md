# node-sberbank-acquiring

Библиотка для API интернет-эквайринга сбербанка, Node.js

Acquiring library for sberbank acquiring

Beta! Checksum verifying is under development and not implemented yet

**Use at own risk**

Supports only one-step payments without OFD

Supports test api entry

Official API documentation: https://securepayments.sberbank.ru/wiki/doku.php/main_page

## Install

`npm i sberbank-acquiring`

## Use

```javascript
const Acquiring = require('sberbank-acquiring');
const acquiring = new Acquiring({ userName: ..., password: ... }, 'https://success_link'[, true]);
```

Set third unnecessary parameter to true to use test api entry (https://securepayments.sberbank.ru/payment/rest/ instead of https://3dsec.sberbank.ru/payment/rest/)

New order:

```javascript
const resp = await acquiring.register(orderNumber, amount, description);
```

Checking status:

```javascript
const status1 = await acquiring.status(orderId);
const status2 = await acquiring.status(null, orderNumber);
```

provide only orderId or orderNumber.
returns null if order doesn't exist or status number (see sberbank docs)

be careful that the result can be null if the order doesn't exist and also it can be 0 if the order is REGISTERED_BUT_NOT_PAID, use === to check.

Getting order info:

```javascript
const info1 = await acquiring.get(orderId);
const info2 = await acquiring.get(null, orderNumber);
```

provide only orderId or orderNumber.
returns object with information on the order

Refund:

```javascript
const refundResult = await acquiring.refund(orderId, amount);
```

`refundResult` example: `{ errorCode: '0', errorMessage: 'Успешно' }`

Get bindings:

```javascript
const getBindingsResult = await acquiring.getBindings(clientId);
```

Unbind card:

```javascript
const unBindCardResult = await acquiring.unBindCard(bindingId);
```


## 1.3.0

- The library no longer modifies the global `axios.defaults.httpsAgent`. It sends requests through its own axios
  instance whose agent trusts the Russian Trusted Root/Sub CA (Sberbank hosts are signed by them). Previously, when
  npm deduplicated axios with the application's copy, every other HTTPS request of the application trusted only
  these two CAs and failed for regular hosts.
- `Acquiring.russianTrustedCa` — PEM buffers of the Russian Trusted Root/Sub CA, for applications that need them for
  other hosts: `new https.Agent({ ca: [...tls.rootCertificates, ...Acquiring.russianTrustedCa] })`.
- axios ^1.21.1.
