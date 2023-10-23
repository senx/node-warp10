[@senx/warp10](../README.md) / [Modules](../modules.md) / [warp10](../modules/warp10.md) / Warp10

# Class: Warp10

[warp10](../modules/warp10.md).Warp10

## Table of contents

### Constructors

- [constructor](warp10.Warp10.md#constructor)

### Properties

- [LOG](warp10.Warp10.md#log)
- [client](warp10.Warp10.md#client)
- [endpoint](warp10.Warp10.md#endpoint)
- [options](warp10.Warp10.md#options)
- [timeoutOptions](warp10.Warp10.md#timeoutoptions)
- [url](warp10.Warp10.md#url)

### Methods

- [delete](warp10.Warp10.md#delete)
- [exec](warp10.Warp10.md#exec)
- [fetch](warp10.Warp10.md#fetch)
- [formatLabels](warp10.Warp10.md#formatlabels)
- [getOptions](warp10.Warp10.md#getoptions)
- [meta](warp10.Warp10.md#meta)
- [send](warp10.Warp10.md#send)
- [setTimeout](warp10.Warp10.md#settimeout)
- [update](warp10.Warp10.md#update)
- [formatValues](warp10.Warp10.md#formatvalues)

## Constructors

### constructor

• **new Warp10**(`endpoint`, `debug?`)

Create new Warp 10 connector.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `endpoint` | `string` | `undefined` | Warp 10 endpoint, without <code>/api/v0</code> at the end. |
| `debug` | `boolean` | `false` | Enable debug |

**`Example`**

```
const w10 = new Warp10('https://sandbox.senx.io');
```

#### Defined in

[warp10.ts:49](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L49)

## Properties

### LOG

• `Private` **LOG**: [`Logger`](logger.Logger.md)

#### Defined in

[warp10.ts:37](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L37)

___

### client

• `Private` **client**: `any`

#### Defined in

[warp10.ts:35](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L35)

___

### endpoint

• `Private` **endpoint**: `URL`

#### Defined in

[warp10.ts:36](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L36)

___

### options

• `Private` **options**: `any` = `{}`

#### Defined in

[warp10.ts:33](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L33)

___

### timeoutOptions

• `Private` **timeoutOptions**: `number` = `0`

#### Defined in

[warp10.ts:34](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L34)

___

### url

• `Private` **url**: `string`

#### Defined in

[warp10.ts:32](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L32)

## Methods

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

[warp10.ts:255](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L255)

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

[warp10.ts:139](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L139)

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
| `start` | `string` | `undefined` | ISO8601 UTC Date or UTC timstamp (in platform timeunit format) |
| `stop` | `any` | `undefined` | ISO8601 UTC Date if 'start' is a ISO8601 date. Timespan (in platform timeunit format) if 'start' is a timestamp |
| `format` | ``"raw"`` \| ``"text"`` \| ``"json"`` \| ``"fulltext"`` \| ``"tsv"`` \| ``"fulltsv"`` \| ``"pack"`` | `'json'` | Output format: text' \| 'fulltext' \| 'json' \| 'tsv' \| 'fulltsv' \| 'pack' \| 'raw', default is 'json' |
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

[warp10.ts:171](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L171)

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

[warp10.ts:99](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L99)

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

[warp10.ts:114](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L114)

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

[warp10.ts:291](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L291)

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

[warp10.ts:59](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L59)

___

### setTimeout

▸ **setTimeout**(`to`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `to` | `number` |

#### Returns

`void`

#### Defined in

[warp10.ts:300](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L300)

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

[warp10.ts:216](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L216)

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

[warp10.ts:103](https://gitlab.com/senx/node-warp10/-/blob/28e1413/src/lib/warp10.ts#L103)
