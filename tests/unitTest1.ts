/*
 *  Copyright 2019 SenX S.A.S.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
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


const warp10url: string = "http://localhost:8080"

let warp:Warp10 = new Warp10(warp10url);

let unreachablewarp:Warp10 = new Warp10("http://donotexist.donotexist")


warp.exec("'ca%25'").then(answer => {expect(answer.result[0]).to.equal('ca%')},err => { console.log(err)})

warp.exec("'éè™'").then(answer => {expect(answer.result[0]).to.equal('éè™')},err => { console.log(err)})

warp.exec("2 2 +").then(answer => {expect(answer.result[0]).to.equal(4)},err => { console.log(err)})

warp.exec("").then(answer => {assert.typeOf(answer.result,"Array","stack should be an array")},err => { console.log(err)})


