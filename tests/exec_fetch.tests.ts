/*
 * Copyright 2023 SenX S.A.S.
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

import {AbstractTests} from "./abstractTests";
import {suite, test} from "mocha-typescript";
import {expect, should} from "chai";

@suite('Exec & Fetch tests')
export class ExecFetchTests extends AbstractTests {
  private readToken: string = '';
  private writeToken: string = '';
  private deleteToken: string = '';

  // noinspection JSUnusedGlobalSymbols
  async before() {
    const answer = await this.send(this.sandboxUrl + 'tokens');
    const result = JSON.parse(answer);
    this.readToken = result.read;
    this.writeToken = result.write
    this.deleteToken = result.delete;
    should().exist(this.readToken);
    should().exist(this.writeToken);
    should().exist(this.deleteToken);
    await this.warp.exec(`NEWGTS 'test' RENAME 0 2514 <%
   NaN NaN NaN RAND ADDVALUE
%> FOR '${this.writeToken}' UPDATE`);
  }

  @test('Should fetch in fulltext mode with the first timestamp = 2514')
  async test01() {
    const r = await this.warp.fetch(this.readToken, 'test', {}, '1970-01-01T00:00:00.000Z', '1970-01-01T01:00:00.000Z', 'fulltext');
    expect(r.result.length).gte(0, 'There is no result');
    expect(r.result[0].split('//')[0]).eq('2514', 'Wrong timestamp');
  }

  @test('Should fetch in json mode with the first timestamp = 2514')
  async test02() {
    const r = await this.warp.fetch(this.readToken, 'test', {}, '1970-01-01T00:00:00.000Z', '1970-01-01T01:00:00.000Z', 'json', true);
    expect(r.result.length, 'There is no result').gte(0);
    expect(r.result[0].v[0][0], 'Wrong timestamp').eq(2514);
  }
}