/*
 * Copyright 2020-2023 SenX S.A.S.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License');
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {Warp10} from '../src/warp10';
import {assert, expect, should} from 'chai'; // Using Assert style // Using Expect style
import {performance} from 'perf_hooks';
import {describe} from 'mocha';
import {get} from "https";

const warp10url: string = 'http://localhost:8080';
const warp: Warp10 = new Warp10(warp10url, true);
const unreachablewarp: Warp10 = new Warp10('http://donotexist.donotexist');


async function send(url: string): Promise<any> {
  let body: string = '';
  return new Promise((resolve, reject) => {
    const req: any = get(url, (res: any) => {
      res.on("data", (chunk: any) => body += chunk);
      res.on("error", (err: any) => reject(err));
      res.on("end", () => {
        try {
          resolve(body);
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on("error", (err: any) => reject(err));
    req.on('timeout', (err: any) => {
      reject(err);
      req.abort();
    });
    req.on('uncaughtException', (err: any) => {
      req.abort();
      reject(err);
    });
    req.end(() => {
    });
  });
}


describe('Starting basic tests', () => {
  it('\'2 2 +\'', () =>
    new Promise((resolve, reject) =>
      warp.exec('2 2 +')
        .then(answer => {
          expect(answer.result[0]).to.equal(4);
          resolve(true)
        })
        .catch(err => reject(err))
    )
  );

  it('\'ca%25\'', () =>
    new Promise((resolve, reject) =>
      warp.exec('"ca%25"')
        .then(answer => {
          expect(answer.result[0]).to.equal('ca%');
          resolve(true)
        })
        .catch(err => reject(err))
    )
  );

  it('\'éè™\'', () =>
    new Promise((resolve, reject) =>
      warp.exec('"éè™"')
        .then(answer => {
          expect(answer.result[0]).to.equal('éè™');
          resolve(true)
        })
        .catch(err => reject(err))
    )
  );

  it('2 2 +', () =>
    new Promise((resolve, reject) =>
      warp.exec('2 2 +')
        .then(answer => {
          expect(answer.result[0]).eq(4);
          resolve(true)
        })
        .catch(err => reject(err))
    )
  );

  it('""', () =>
    new Promise((resolve, reject) =>
      warp.exec('')
        .then(answer => {
          assert.typeOf(answer.result, 'Array', 'stack should be an array');
          resolve(true)
        })
        .catch(err => reject(err))
    )
  );

  it('{}', () =>
    new Promise((resolve, reject) =>
      warp.exec('{}')
        .then(answer => {
          assert.typeOf(answer.result[0], 'Object');
          resolve(true)
        })
        .catch(err => reject(err))
    )
  );
});

describe('Starting timeoutTests tests', () => {
  unreachablewarp.setTimeout(1000);
  let startTime: number = performance.now();
  it('Should fail on unreachable', () => {
    return new Promise((resolve, reject) =>
      unreachablewarp.exec('2 2 +').then(() => {
        assert(false, 'this unreachable endpoint should not be a success');
        reject('this unreachable endpoint should not be a success')
      }, err => {
        expect(err.code, 'error code when host unreachable').eq('ENOTFOUND');
        resolve(true);
      })
    );
  });

  it('Should timeout under 2s', () => {
    expect(performance.now() - startTime, 'timeout set to 1s, execution time should be under 2s.').lt(2000);
  });

});

describe('Starting exec and fetch', () => {

  let readToken: string;
  let writeToken: string;
  let deleteToken: string;
  const sandboxUrl: string = 'https://sandbox.senx.io/';
  const sb: Warp10 = new Warp10(sandboxUrl);

  // fetch tokens from the sandbox
  it('Should get a token', () =>
    new Promise(async resolve => {
      const body = await send(sandboxUrl + 'tokens');
      const result = JSON.parse(body);
      readToken = result.read;
      writeToken = result.write
      deleteToken = result.delete;
      should().exist(readToken);
      should().exist(writeToken);
      should().exist(deleteToken);
      resolve(true);
    })
  );

  it('Should insert random data', () =>
    new Promise((resolve, reject) =>
      sb.exec(`NEWGTS 'test' RENAME 0 2514 <%
   NaN NaN NaN RAND ADDVALUE
%> FOR '${writeToken}' UPDATE`)
        .then(() => resolve(true))
        .catch(err => reject(err))
    ));

  it('Should fetch in fulltext mode with the first timestamp = 2514', () =>
    new Promise((resolve, reject) => {
      sb.fetch(readToken, 'test', {}, '1970-01-01T00:00:00.000Z', '1970-01-01T01:00:00.000Z', 'fulltext')
        .then(r => {
          expect(r.result.length).gte(0, 'There is no result')
          expect(r.result[0].split('//')[0]).eq('2514', 'Wrong timestamp');
          resolve(true);
        })
        .catch(err => reject(err))
    })
  );

  it('Should fetch in json mode with the first timestamp = 2514', () =>
    new Promise((resolve, reject) => {
      sb.fetch(readToken, 'test', {}, '1970-01-01T00:00:00.000Z', '1970-01-01T01:00:00.000Z', 'json', true)
        .then(r => {
          expect(r.result.length, 'There is no result').gte(0)
          console.log(r.result[0].v[0])
          const firstTT = r.result[0].v[0][0];
          expect(firstTT, 'Wrong timestamp').eq(2514);
          resolve(true);
        })
        .catch(err => reject(err))
    })
  );
})


describe('Starting CRUD tests', () => {
// the ù is something volunteer
  const updateTest: any[] = [`
1566893344654882/48.81:-4.147/124 io.warp10.tùst{key=valùe} 3.14
`,
    {
      timestamp: 1566893344654883,
      className: 'io.warp10.tùst',
      labels: {key: 'valùe'},
      value: 4.0
    }];


  let readToken: string;
  let writeToken: string;
  let deleteToken: string;
  const sandboxUrl: string = 'https://sandbox.senx.io/';
  const sb: Warp10 = new Warp10(sandboxUrl);

  // fetch tokens from the sandbox
  it('Should get a token', () => {
    return new Promise(async resolve => {
      const body = await send(sandboxUrl + 'tokens');
      const result = JSON.parse(body);
      readToken = result.read;
      writeToken = result.write
      deleteToken = result.delete;
      should().exist(readToken);
      should().exist(writeToken);
      should().exist(deleteToken);
      resolve(true);
    });
  });

  it('Should push data to https://sandbox.senx.io/', () =>
    new Promise((resolve, reject) =>
      sb.update(writeToken, updateTest)
        .then(() => resolve(true))
        .catch(err => reject(err))
    ));

  it('Should read via FETCH exec', () =>
    new Promise((resolve, reject) => {
      sb.exec(`[ '${readToken}' '~io.warp10.*' {} NOW -10 ] FETCH SORT`)
        .then(ans => {
          expect(ans.result[0][0].c).eq('io.warp10.tùst', 'unicode problem somewhere in update or exec classname');
          expect(ans.result[0][0].l.key).eq('valùe', 'unicode problem somewhere in update or exec labels');
          expect(ans.result[0][0].v.length).eq(2, 'must be two datapoints');
          resolve(true);
        })
        .catch(err => reject(err));
    })
  );

  it('Should read via FETCH endpoint', () =>
    new Promise((resolve, reject) => {
      sb.fetch(readToken, '~io.warp10.*', {'key': 'valùe'}, '2019-11-21T12:34:43.388409Z', -2, 'text')
        .then(answer => {
          expect(answer.result.length).gte(2, 'fetch must be at least two lines');
          assert(answer.result[1].toString().startsWith('='), 'second line of text fetch must be equal')
          resolve(true);
        }).catch(err => reject(err));
    })
  );


  it('Should delete via DELETE endpoint', () =>
    new Promise((resolve, reject) => {
      sb.delete(deleteToken, '~io.warp10.*', {}, '', '', true)
        .then(() => {
          sb.exec(`[ '${readToken}' '~io.warp10.*' {} NOW -10 ] FETCH SIZE`).then(ans => {
            expect(ans.result[0]).eq(0, 'there must be no more value after deleteall');
            resolve(true);
          }).catch(err => reject(err));
        }).catch(err => reject(err));
    })
  );
});
