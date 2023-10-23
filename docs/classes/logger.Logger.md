[@senx/warp10](../README.md) / [Modules](../modules.md) / [logger](../modules/logger.md) / Logger

# Class: Logger

[logger](../modules/logger.md).Logger

## Table of contents

### Constructors

- [constructor](logger.Logger.md#constructor)

### Properties

- [className](logger.Logger.md#classname)
- [isDebug](logger.Logger.md#isdebug)

### Methods

- [debug](logger.Logger.md#debug)
- [error](logger.Logger.md#error)
- [info](logger.Logger.md#info)
- [log](logger.Logger.md#log)
- [warn](logger.Logger.md#warn)

## Constructors

### constructor

• **new Logger**(`className`, `isDebug?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `className` | `any` | `undefined` |
| `isDebug` | `boolean` | `false` |

#### Defined in

[logger.ts:24](https://gitlab.com/senx/node-warp10/-/blob/b1452af/src/lib/logger.ts#L24)

## Properties

### className

• **className**: `string`

#### Defined in

[logger.ts:21](https://gitlab.com/senx/node-warp10/-/blob/b1452af/src/lib/logger.ts#L21)

___

### isDebug

• **isDebug**: `boolean` = `false`

#### Defined in

[logger.ts:22](https://gitlab.com/senx/node-warp10/-/blob/b1452af/src/lib/logger.ts#L22)

## Methods

### debug

▸ **debug**(`methods`, `...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methods` | `any`[] |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

[logger.ts:60](https://gitlab.com/senx/node-warp10/-/blob/b1452af/src/lib/logger.ts#L60)

___

### error

▸ **error**(`methods`, `...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methods` | `any`[] |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

[logger.ts:64](https://gitlab.com/senx/node-warp10/-/blob/b1452af/src/lib/logger.ts#L64)

___

### info

▸ **info**(`methods`, `...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methods` | `any`[] |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

[logger.ts:72](https://gitlab.com/senx/node-warp10/-/blob/b1452af/src/lib/logger.ts#L72)

___

### log

▸ **log**(`level`, `methods`, `args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `level` | [`LEVEL`](../enums/logger.LEVEL.md) |
| `methods` | `any`[] |
| `args` | `any`[] |

#### Returns

`void`

#### Defined in

[logger.ts:29](https://gitlab.com/senx/node-warp10/-/blob/b1452af/src/lib/logger.ts#L29)

___

### warn

▸ **warn**(`methods`, `...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methods` | `any`[] |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

[logger.ts:68](https://gitlab.com/senx/node-warp10/-/blob/b1452af/src/lib/logger.ts#L68)
