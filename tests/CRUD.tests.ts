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

import {suite, test} from "mocha-typescript";
import {assert, expect, should} from "chai";
import {AbstractTests} from "./abstractTests";
import {DataPoint} from "../src";

@suite('CRUD tests')
export class CRUDTests extends AbstractTests {

  private updateTest: any[] = [`
1566893344654882/48.81:-4.147/124 io.warp10.tùst{key=valùe} 3.14
`,
    {
      timestamp: 1566893344654883,
      className: 'io.warp10.tùst',
      labels: {key: 'valùe'},
      value: 4.0
    },
    {...new DataPoint(), className: 'io.warp10.test.string', labels: {key: 'val'}, value: 'aaa', timestamp: 0, lat: -5.0, lng: 0, elev: 10},
    {...new DataPoint(), className: 'io.warp10.test.boolean', labels: {key: 'val'}, value: true, timestamp: 0},
  ];
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
    await this.warp.update(this.writeToken, this.updateTest);
  }

  @test('Should read via FETCH endpoint')
  async test01() {
    const answer = await this.warp.fetch(this.readToken, '~io.warp10.*', {'key': 'valùe'}, '2019-11-21T12:34:43.388409Z', -2, 'text');
    expect(answer.result.length).gte(2, 'fetch must be at least two lines');
    assert(answer.result[1].toString().startsWith('='), 'second line of text fetch must be equal');
  }

  @test('Should read a numeric value')
  async test02() {
    const answer = await this.warp.fetch(this.readToken, 'io.warp10.tùst', {'key': 'valùe'}, '2019-11-21T12:34:43.388409Z', -2, 'json');
    expect(answer.result.length, 'There is no result').gte(0);
    expect(answer.result[0].v[0][0], 'Wrong timestamp').eq(1566893344654883);
    expect(answer.result[0].v[0][1], 'Wrong value').eq(4);
  }


  @test('Should read a string value')
  async test03() {
    const answer = await this.warp.fetch(this.readToken, 'io.warp10.test.string', {}, '2023-12-31T00:00:00.000000Z', -1, 'json');
    expect(answer.result.length, 'There is no result').gte(0);
    expect(answer.result[0].v[0][0], 'Wrong timestamp').eq(0);
    expect(answer.result[0].v[0][4], 'Wrong value').eq('aaa');
  }

  @test('Should read a boolean value')
  async test04() {
    const answer = await this.warp.fetch(this.readToken, 'io.warp10.test.boolean', {}, '2023-12-31T00:00:00.000000Z', '1969-12-31T00:00:00.000000Z', 'json');
    expect(answer.result.length, 'There is no result').gte(0);
    expect(answer.result[0].v[0][0], 'Wrong timestamp').eq(0);
    expect(answer.result[0].v[0][1], 'Wrong value').eq(true);
  }

  @test('Get formatted output')
  async test05() {
    const answer = await this.warp.fetch(this.readToken, '~io.warp10.test.*', {}, '2023-12-31T00:00:00.000000Z', '1969-12-31T00:00:00.000000Z');
    expect(answer.result.length, 'There is no result').eq(2);

    const strGTS = answer.result.filter(gts => gts.name === 'io.warp10.test.string')[0];
    const boolGTS = answer.result.filter(gts => gts.name === 'io.warp10.test.boolean')[0];


    expect(strGTS.data[0].ts, 'Wrong timestamp for io.warp10.test.string').eq(0);
    expect(strGTS.data[0].value, 'Wrong value for io.warp10.test.string').eq('aaa');
    should().exist(strGTS.data[0].loc, 'Wrong location for io.warp10.test.string');
    expect(Math.round(strGTS.data[0].loc.lat), 'Wrong lat for io.warp10.test.string').eq(-5);
    expect(strGTS.data[0].loc.long, 'Wrong long for io.warp10.test.string').eq(0);
    expect(strGTS.data[0].elev, 'Wrong elev for io.warp10.test.string').eq(10);

    expect(boolGTS.data[0].ts, 'Wrong timestamp for io.warp10.test.boolean').eq(0);
    expect(boolGTS.data[0].value, 'Wrong value for io.warp10.test.boolean').eq(true);
  }

  @test('Should delete via DELETE endpoint')
  async test10() {
    await this.warp.delete(this.deleteToken, '~io.warp10.*', {}, '', '', true);
    const answer = await this.warp.exec(`[ '${this.readToken}' '~io.warp10.*' {} NOW -10 ] FETCH SIZE`);
    expect(answer.result[0]).eq(0, 'there must be no more value after deleteall');
  }
}