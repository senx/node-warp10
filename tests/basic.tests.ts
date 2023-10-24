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

import {suite, test} from 'mocha-typescript';
import {AbstractTests} from "./abstractTests";
import {assert, expect} from "chai";

@suite('Basic tests')
export class BasicTests extends AbstractTests {

  @test('\'2 2 +\'')
  async test01() {
    const answer = await this.warp.exec('2 2 +');
    expect(answer.result[0]).to.equal(4);
  }

  @test('\'ca%25\'')
  async test02() {
    const answer = await this.warp.exec('"ca%25"');
    expect(answer.result[0]).to.equal('ca%');
  }

  @test('\'éè™\'')
  async test03() {
    const answer = await this.warp.exec('"éè™"');
    expect(answer.result[0]).to.equal('éè™');
  }

  @test('Empty WarpScript')
  async test04() {
    const answer = await this.warp.exec('');
    assert.typeOf(answer.result, 'Array', 'stack should be an array');
  }

  @test('Empty Map')
  async test05() {
    const answer = await this.warp.exec('{}');
    assert.typeOf(answer.result[0], 'Object');
  }
}
