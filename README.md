[![npm version](https://badge.fury.io/js/%40senx%2Fwarp10.svg)](https://badge.fury.io/js/%40senx%2Fwarp10) 

# Warp&nbsp;10 Node lib

Node.js library that helps to interact with Warp&nbsp;10.

[APIDoc](./docs/classes/warp10.Warp10.md)

## Installation

    npm i @senx/warp10
    yarn add @senx/warp10

## Dates and formats

Date format: UTC ISO8601 strings (YYYY-MM-DDTHH:MM:SS.SSSSSSZ)

Available fetch formats:

- text
- fulltext
- json
- tsv
- fulltsv
- pack
- raw
- formatted (a json format, default)

## Usage sample

```javascript
import {Warp10} from "@senx/warp10";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const writeToken = 'xxxxxx';
const deleteToken = 'xxxxxx';
const readToken = 'xxxx';
const w10 = new Warp10().endpoint('https://sandbox.senx.io');
// or const w10 = new Warp10({endpoint: 'https://sandbox.senx.io'});


const test = async () => {

  // WarpScript execution
  console.log(await w10.exec('2 2 +'));
  
  // fetch raw data between 2 dates 
  console.log(await w10.fetch(readToken, '~io.warp10.*', {}, '2019-11-11T12:34:43.388409Z', dayjs().toISOString()));

  // insert data points
  console.log(await w10.update(writeToken, [
    {timestamp: dayjs().utc().valueOf() * 1000, className: 'io.warp10.test', labels: {key: 'value'}, value: 54},
    '1380475081000000// io.warp10.test{key=value} T',
    '1566893344654882/48.81:-4.147/124 io.warp10.test{key=value} [8.2 151 152 1568189745655509/40.6:-74/14 ]',
  ]));

  // write meta
  console.log(await w10.meta(writeToken, [{
    className: 'io.warp10.test',
    labels: {key: 'value'},
    attributes: {attr: 'value'}
  }]));

  // Fetch data with a time span
  console.log(await w10.fetch(readToken, '~.*', {}, dayjs().toISOString(), 86400000000 * 5));

  // delete data between 2 dates
  console.log(await w10.delete(deleteToken, '~io.warp10.test*', {key: 'value'}, '2019-11-11T12:34:43.388409Z', dayjs().toISOString()));
  
  // delete all
  console.log(await w10.delete(deleteToken, '~io.warp10.test*', {key: 'value'}, '', '', true));
};

test().then(() => {

});
```
