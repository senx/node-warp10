import { Warp10 } from "../lib/warp10";
import { assert } from 'chai';  // Using Assert style
import { expect } from 'chai';  // Using Expect style
import { should } from 'chai';  // Using Should style


const warp10url: string = "http://localhost:8080"

let warp:Warp10 = new Warp10(warp10url);

let unreachablewarp:Warp10 = new Warp10("http://donotexist.donotexist")


warp.exec("'ca%25'").then(answer => {expect(answer.result[0]).to.equal('ca%')},err => { console.log(err)})

warp.exec("'éè™'").then(answer => {expect(answer.result[0]).to.equal('éè™')},err => { console.log(err)})

//assert.typeOf(foo, 'string', 'foo is a string'); // with optional message


