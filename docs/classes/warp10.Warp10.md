[@senx/warp10](../README.md) / [Modules](../modules.md) / [warp10](../modules/warp10.md) / Warp10

# Class: Warp10

[warp10](../modules/warp10.md).Warp10

## Table of contents

### Constructors

- [constructor](warp10.Warp10.md#constructor)

### Properties

- [LOG](warp10.Warp10.md#log)
- [\_endpoint](warp10.Warp10.md#_endpoint)
- [\_headers](warp10.Warp10.md#_headers)
- [\_timeUnit](warp10.Warp10.md#_timeunit)
- [\_timeout](warp10.Warp10.md#_timeout)
- [client](warp10.Warp10.md#client)
- [url](warp10.Warp10.md#url)

### Methods

- [debug](warp10.Warp10.md#debug)
- [delete](warp10.Warp10.md#delete)
- [endpoint](warp10.Warp10.md#endpoint)
- [exec](warp10.Warp10.md#exec)
- [fetch](warp10.Warp10.md#fetch)
- [formatGTS](warp10.Warp10.md#formatgts)
- [formatLabels](warp10.Warp10.md#formatlabels)
- [getOptions](warp10.Warp10.md#getoptions)
- [headers](warp10.Warp10.md#headers)
- [meta](warp10.Warp10.md#meta)
- [send](warp10.Warp10.md#send)
- [silent](warp10.Warp10.md#silent)
- [timeUnit](warp10.Warp10.md#timeunit)
- [timeout](warp10.Warp10.md#timeout)
- [update](warp10.Warp10.md#update)
- [formatValues](warp10.Warp10.md#formatvalues)

## Constructors

### constructor

• **new Warp10**(`params?`)

Create new Warp 10 connector.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params?` | `Object` | { endpoint: string; debug?: boolean; silent?: boolean, timeUnit: TimeUnits } endpoint - Warp 10 endpoint, without <code>/api/v0</code> at the end. debug - Enable debug silent - Do not produce logs timeUnit - Platform timeUnit |
| `params.debug?` | `boolean` | - |
| `params.endpoint?` | `string` | - |
| `params.headers?` | `Object` | - |
| `params.silent?` | `boolean` | - |
| `params.timeUnit?` | [`TimeUnits`](../enums/warp10.TimeUnits.md) | - |
| `params.timeout?` | `number` | - |

**`See`**

TimeUnits
headers - custom HTTP headers
timeout - http Timeout

**`Example`**

```
// standard constructor
const w10 = new Warp10({endpoint: 'https://sandbox.senx.io'});
// builder pattern
const w10 = new Warp10().endpoint('https://sandbox.senx.io').timeUnit(TimeUnits.US);
```

#### Defined in

[warp10.ts:63](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L63)

## Properties

### LOG

• `Private` **LOG**: [`Logger`](logger.Logger.md)

#### Defined in

[warp10.ts:38](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L38)

___

### \_endpoint

• `Private` **\_endpoint**: `undefined` \| `URL`

#### Defined in

[warp10.ts:39](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L39)

___

### \_headers

• `Private` `Optional` **\_headers**: `Object` = `{}`

#### Index signature

▪ [key: `string`]: `string`

#### Defined in

[warp10.ts:41](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L41)

___

### \_timeUnit

• `Private` **\_timeUnit**: `undefined` \| [`TimeUnits`](../enums/warp10.TimeUnits.md)

#### Defined in

[warp10.ts:40](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L40)

___

### \_timeout

• `Private` **\_timeout**: `number` = `0`

#### Defined in

[warp10.ts:42](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L42)

___

### client

• `Private` **client**: `any`

#### Defined in

[warp10.ts:37](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L37)

___

### url

• `Private` **url**: `undefined` \| `string`

#### Defined in

[warp10.ts:36](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L36)

## Methods

### debug

▸ **debug**(`debug`): [`Warp10`](warp10.Warp10.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `debug` | `boolean` |

#### Returns

[`Warp10`](warp10.Warp10.md)

#### Defined in

[warp10.ts:95](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L95)

___

### delete

▸ **delete**(`deleteToken`, `className`, `labels`, `start`, `end`, `deleteAll?`): `Promise`<{ `result`: `string`  }\>

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `deleteToken` | `string` | `undefined` | Delete token |
| `className` | `string` | `undefined` | ClassName, could be a regexp starting with '\~' (ie: '~io.warp10.*' ) |
| `labels` | `object` | `undefined` | Labels key value map. Could be a regexp starting with '\~' (ie: { 'myLabel': '~sensor_.*' } ) |
| `start` | `string` | `undefined` | ISO8601 UTC Date |
| `end` | `string` | `undefined` | ISO8601 UTC Date |
| `deleteAll` | `boolean` | `false` | Default is 'false' |

#### Returns

`Promise`<{ `result`: `string`  }\>

**`Example`**

```
// delete data between 2 dates
console.log(await w10.delete(deleteToken, '~io.warp10.test*', {key: 'value'}, '2019-11-11T12:34:43.388409Z', '2019-11-21T12:34:43.388409Z'));

// delete all
console.log(await w10.delete(deleteToken, '~io.warp10.test*', {key: 'value'}, '', '', true));
```

#### Defined in

[warp10.ts:320](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L320)

___

### endpoint

▸ **endpoint**(`endpoint`): [`Warp10`](warp10.Warp10.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpoint` | `undefined` \| `string` |

#### Returns

[`Warp10`](warp10.Warp10.md)

#### Defined in

[warp10.ts:81](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L81)

___

### exec

▸ **exec**(`warpScript`): `Promise`<{ `meta`: { `elapsed`: `number` ; `fetched`: `number` ; `ops`: `number`  } ; `result`: `any`[]  }\>

Execute a WarpScript against a Warp 10 instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `warpScript` | `string` | WarpScript to execute |

#### Returns

`Promise`<{ `meta`: { `elapsed`: `number` ; `fetched`: `number` ; `ops`: `number`  } ; `result`: `any`[]  }\>

**`Example`**

```
 // Prints "[4]":
 console.log(await w10.exec('2 2 +'))
```

#### Defined in

[warp10.ts:193](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L193)

___

### fetch

▸ **fetch**(`readToken`, `className`, `labels`, `start`, `stop`, `format?`, `dedup?`): `Promise`<{ `meta`: { `elapsed`: `number` ; `fetched`: `number` ; `ops`: `number`  } ; `result`: `any`[]  }\>

Fetch data against a Warp 10 instance

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `readToken` | `string` | `undefined` | Read token |
| `className` | `string` | `undefined` | ClassName, could be a regexp starting with '\~' (ie: '~io.warp10.*' ) |
| `labels` | `object` | `undefined` | Labels key value map. Could be a regexp starting with '\~' (ie: { 'myLabel': '~sensor_.*' } ) |
| `start` | `string` | `undefined` | ISO8601 UTC Date |
| `stop` | `any` | `undefined` | ISO8601 UTC Date if 'start' is a ISO8601 date. Timespan (in platform timeunit format) if 'start' is a timestamp |
| `format` | ``"raw"`` \| ``"text"`` \| ``"json"`` \| ``"fulltext"`` \| ``"tsv"`` \| ``"fulltsv"`` \| ``"pack"`` \| ``"formatted"`` | `'formatted'` | Output format: text' \| 'fulltext' \| 'json' \| 'tsv' \| 'fulltsv' \| 'pack' \| 'raw' \| 'formatted', default is 'formatted' |
| `dedup` | `boolean` | `true` | Deduplicates data (default is true) |

#### Returns

`Promise`<{ `meta`: { `elapsed`: `number` ; `fetched`: `number` ; `ops`: `number`  } ; `result`: `any`[]  }\>

**`Example`**

```
// fetch raw data between 2 dates
console.log(await w10.fetch(readToken, '~io.warp10.*', {}, '2019-11-11T12:34:43.388409Z', '2019-11-21T12:34:43.388409Z', 'json'));

// Fetch data with a time span
console.log(await w10.fetch(readToken, '~.*', {}, '2019-11-21T12:34:43.388409Z', 86400000000 * 5));
```

#### Defined in

[warp10.ts:225](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L225)

___

### formatGTS

▸ `Private` **formatGTS**(`gtsList`): { `attributes`: `any` = gts.a; `data`: `any`[] ; `labels`: `any` = gts.l; `name`: `any` = gts.c }[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `gtsList` | `any`[] |

#### Returns

{ `attributes`: `any` = gts.a; `data`: `any`[] ; `labels`: `any` = gts.l; `name`: `any` = gts.c }[]

#### Defined in

[warp10.ts:373](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L373)

___

### formatLabels

▸ `Private` **formatLabels**(`labels`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `labels` | `any` |

#### Returns

`string`

#### Defined in

[warp10.ts:365](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L365)

___

### getOptions

▸ `Private` **getOptions**(`path`, `method?`, `warpToken?`): `any`

Build got request options from defined options

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `path` | `string` | `undefined` | request path |
| `method` | `string` | `'GET'` | request method |
| `warpToken?` | `string` | `undefined` | the X-Warp10-Token, if any |

#### Returns

`any`

#### Defined in

[warp10.ts:164](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L164)

___

### headers

▸ **headers**(`headers`): [`Warp10`](warp10.Warp10.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `headers` | `Object` |

#### Returns

[`Warp10`](warp10.Warp10.md)

#### Defined in

[warp10.ts:90](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L90)

___

### meta

▸ **meta**(`writeToken`, `meta`): `Promise`<{ `count`: `number` ; `response`: `string`  }\>

Update Meta

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `writeToken` | `string` | Write token |
| `meta` | { `attributes`: `object` ; `className`: `string` ; `labels`: `object`  }[] | Metadata key value map to update |

#### Returns

`Promise`<{ `count`: `number` ; `response`: `string`  }\>

**`Example`**

```
// write meta
  console.log(await w10.meta(writeToken, [{
    className: 'io.warp10.test',
    labels: {key: 'value'},
    attributes: {attr: 'value'}
  }]));
```

#### Defined in

[warp10.ts:356](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L356)

___

### send

▸ `Private` **send**(`options`, `data?`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `RequestOptions` \| `RequestOptions` |
| `data?` | `any` |

#### Returns

`Promise`<`any`\>

#### Defined in

[warp10.ts:117](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L117)

___

### silent

▸ **silent**(`silent`): [`Warp10`](warp10.Warp10.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `silent` | `boolean` |

#### Returns

[`Warp10`](warp10.Warp10.md)

#### Defined in

[warp10.ts:100](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L100)

___

### timeUnit

▸ **timeUnit**(`timeUnit`): [`Warp10`](warp10.Warp10.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `timeUnit` | [`TimeUnits`](../enums/warp10.TimeUnits.md) |

#### Returns

[`Warp10`](warp10.Warp10.md)

#### Defined in

[warp10.ts:105](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L105)

___

### timeout

▸ **timeout**(`to`): [`Warp10`](warp10.Warp10.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `to` | `number` |

#### Returns

[`Warp10`](warp10.Warp10.md)

#### Defined in

[warp10.ts:110](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L110)

___

### update

▸ **update**(`writeToken`, `datapoints`): `Promise`<{ `count`: `number` ; `response`: `undefined` \| `string`  }\>

Update datapoints

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `writeToken` | `string` | Write token |
| `datapoints` | (`string` \| [`DataPoint`](DataPoint.DataPoint.md))[] | Datapoints to update |

#### Returns

`Promise`<{ `count`: `number` ; `response`: `undefined` \| `string`  }\>

**`Example`**

```
console.log(await w10.update(writeToken, [
   {timestamp: moment.utc().valueOf() * 1000, className: 'io.warp10.test', labels: {key: 'value'}, value: 54},
   '1380475081000000// io.warp10.test{key=value} T',
   '1566893344654882/48.81:-4.147/124 io.warp10.test{key=value} [8.2 151 152 1568189745655509/40.6:-74/14 ]',
 ]));
```

#### Defined in

[warp10.ts:281](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L281)

___

### formatValues

▸ `Static` `Private` **formatValues**(`value`): `string` \| `number` \| `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` \| `number` \| `boolean` |

#### Returns

`string` \| `number` \| `boolean`

#### Defined in

[warp10.ts:369](https://gitlab.com/senx/node-warp10/-/blob/36f499e/src/lib/warp10.ts#L369)
