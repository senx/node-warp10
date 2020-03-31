/*
 * Copyright 2020 SenX S.A.S.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
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

import { Warp10 } from "../lib/warp10";
import { assert } from 'chai';  // Using Assert style
import { expect } from 'chai';  // Using Expect style
import { should } from 'chai';  // Using Should style
import { performance } from 'perf_hooks';
import * as got from "got";
import * as moment from 'moment';

const warp10url: string = "http://localhost:8080"

let warp: Warp10 = new Warp10(warp10url);

let unreachablewarp: Warp10 = new Warp10("http://donotexist.donotexist")

console.log("Starting unit tests...");

warp.exec("'ca%25'").then(answer => { expect(answer.result[0]).to.equal('ca%') }, err => { console.log(err) })

warp.exec("'éè™'").then(answer => { expect(answer.result[0]).to.equal('éè™') }, err => { console.log(err) })

warp.exec("2 2 +").then(answer => { expect(answer.result[0]).to.equal(4) }, err => { console.log(err) })

warp.exec("").then(answer => { assert.typeOf(answer.result, "Array", "stack should be an array") }, err => { console.log(err) })

warp.exec("{}").then(answer => { assert.typeOf(answer.result[0], "Object") }, err => { console.log(err) })

//unreachablewarp.exec("2 2 +").then(answer => { assert(false, "this unreachable endpoint should not be a success") }, err => { console.log(err) })



const timeoutTests = async () => {

  unreachablewarp.setTimeout(20000, 1000);

  let starttime: number = performance.now();
  await unreachablewarp.exec("2 2 +").then(
    answer => { assert(false, "this unreachable endpoint should not be a success") },
    err => { expect(err.code, "error code when host unreachable").eq("ENOTFOUND"); }
  )
  let exectime: number = performance.now() - starttime;

  expect(exectime, "timeout set to 1s, execution time should be under 2s.").lt(2000)

}

timeoutTests();


// the ù is something volunteer
const updateTest: any[] = [`
1566893344654882/48.81:-4.147/124 io.warp10.tùst{key=valùe} 3.14
`,
  {
    timestamp: 1566893344654883,
    className: "io.warp10.tùst",
    labels: { key: "valùe" },
    value: 4.0
  }];

const sandBoxTests = async () => {

  let readToken: string = "";
  let writeToken: string = "";
  let deleteToken: string = "";
  const sandboxUrl: string = "https://sandbox.senx.io/";
  //fetch tokens from the sandbox
  await got.get(sandboxUrl + "tokens").then(r => {
    let result = JSON.parse(r.body);
    readToken = result.read;
    writeToken = result.write;
    deleteToken = result.delete;
  }).catch(e => console.log("Unable to get token to do tests on sandbox!"))

  if (readToken && writeToken && deleteToken) {
    console.log("successful get token from " + sandboxUrl);
    let sb: Warp10 = new Warp10(sandboxUrl)

    await sb.update(writeToken, updateTest).catch(err => { console.log("ERROR", err) });
    console.log("successful data push to " + sandboxUrl);
    await sb.exec(`[ '${readToken}' '~.*' {} NOW -10 ] FETCH SORT`).then(ans => {
      expect(ans.result[0][0].c).eq('io.warp10.tùst', 'unicode problem somewhere in update or exec classname');
      expect(ans.result[0][0].l.key).eq('valùe', 'unicode problem somewhere in update or exec labels');
      expect(ans.result[0][0].v.length).eq(2, 'must be two datapoints')
      console.log('successful read via FETCH exec')
    }).catch(err => { console.log("ERROR", err) });
    await sb.fetch(readToken, '~.*', { 'key': 'valùe' }, '2019-11-21T12:34:43.388409Z', -2,'text').then(answer => {
      expect(answer.result.length).gte(2,'fetch must be at least two lines')
      assert((String)(answer.result[1]).startsWith("="),"second line of text fetch must be equal")
    }).catch(err => { console.log("ERROR while fetching", err) });
    await sb.delete(deleteToken, '~.*', {}, '', '', true).then(ans => {
    }).catch(err => { console.log("ERROR while deleting", err) });
    console.log("successful delete");
    await sb.exec(`[ '${readToken}' '~.*' {} NOW -10 ] FETCH SIZE`).then(ans => {
      expect(ans.result[0]).eq(0, 'there must be no more value after deleteall');
    }).catch(err => { console.log("ERROR after delete", err) });

  }
}

sandBoxTests();
