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
import {performance} from "perf_hooks";
import {Warp10} from "../src";

@suite('TimeoutTests tests')
export class TimeoutsTests extends AbstractTests {
  private startTime: number = 0;
  private unreachableInstance: Warp10 = new Warp10('http://donotexist.donotexist', false, true);

  // noinspection JSUnusedGlobalSymbols
  before() {
    this.unreachableInstance.setTimeout(1000);
    this.startTime = performance.now();
  }

  @test('Should fail on unreachable')
  async test01() {
    try {
      await this.unreachableInstance.exec('2 2 +');
      assert(false, 'this unreachable endpoint should not be a success');
    } catch (err: any) {
      expect(err.code, 'error code when host unreachable').eq('ENOTFOUND');
    }
  }

  @test('Should timeout under 2s')
  async test02() {
    expect(performance.now() - this.startTime, 'timeout set to 1s, execution time should be under 2s.').lt(2000);
  }
}
