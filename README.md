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


## 2.0.0

**Breaking changes — please read when upgrading from 1.x:**

- The library no longer modifies the global `axios.defaults.httpsAgent` (fixes #16). Previously it replaced the
  global agent with one that trusts *only* the Russian Trusted Root/Sub CA, which broke other HTTPS requests of the
  host application. If your application (accidentally) relied on that for its own requests to hosts signed by the
  Russian CAs, give those requests their own agent:
  `new https.Agent({ ca: [...tls.rootCertificates, ...Acquiring.russianTrustedCa] })`.
- Requests now go through the library's own axios instance (`acquiring.http`), so interceptors, mocks
  (e.g. `axios-mock-adapter` on the global axios), headers, proxy or timeout set on the global axios after loading the
  library no longer apply to its requests. Attach them to `acquiring.http` instead (`nock` keeps working).
- The typings now reference Node types (`https.Agent`, `Buffer`), so TypeScript projects need `@types/node`.

**New:**

- Optional 4th constructor argument `options`:
  - `{ ca }` — trust other CA certificate(s) instead of the bundled ones (for example after the Russian CAs are
    reissued: the bundled Root is valid until 2032-02-27, the Sub CA until 2027-03-06):
    `new Acquiring(credentials, returnUrl, false, { ca: [fs.readFileSync('new_root.pem')] })`;
  - `{ httpsAgent }` — a complete custom HTTPS agent. Passing both, or an empty `ca`, throws.
- `Acquiring.russianTrustedCa` — PEM buffers of the bundled CAs.
- Types `Acquiring.Options` and `Acquiring.AcquiringCredentials`.
- axios ^1.21.1.
