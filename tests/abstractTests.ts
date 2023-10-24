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

import {Warp10} from "../src";
import {get} from "https";

export class AbstractTests {

  protected sandboxUrl: string = 'https://sandbox.senx.io/';
  protected warp: Warp10 = new Warp10(this.sandboxUrl, false, true);

  protected async send(url: string): Promise<any> {
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
}