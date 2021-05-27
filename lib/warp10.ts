/*
 * Copyright 2020-2021 SenX S.A.S.
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
'use strict'
import {DataPoint} from './DataPoint';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {URL, URLSearchParams} from "url";
import https, {RequestOptions as httpsRequestOpts} from "https";
import http, {RequestOptions as httpRequestOpts} from "http";

dayjs.extend(utc)

/**
 *
 */
export class Warp10 {

  private url: string;
  private options: any = {};
  private timeoutOptions = 0;
  private client: any;
  private endpoint: URL;

  /**
   * Create new Warp 10™ connector.
   *
   * @param endpoint Warp 10 endpoint, without '/api/v0' at the end.
   */
  constructor(endpoint: string) {
    // remove trailing slash if any
    this.url = endpoint.replace(/\/+$/, '');
    this.options.headers = {'Content-Type': 'text/plain; charset=UTF-8', 'X-Warp10-Token': ''};
    this.client = this.url.startsWith('https') ? https : http;
    this.endpoint = new URL(endpoint);
  }

  private async send(options: httpsRequestOpts | httpRequestOpts, data?: any): Promise<any> {
    let body: string = '';
    return new Promise((resolve, reject) => {
      const req: any = this.client.request(options, (res: any) => {
        res.on("data", (chunk: any) => body += chunk);
        res.on("error", (err: any) => reject(err));
        res.on("end", () => {
          try {
            resolve({body, headers: res.headers});
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
      if (data) {
        req.write(data);
      }
       // end the request to prevent ECONNRESET and socket hung errors
      req.end(() => {});
    });
  }


  private formatLabels(labels: any) {
    return `{${Object.keys(labels).map(k => `${k}=${encodeURIComponent(`${labels[k]}`)}`)}}`
  }

  private static formatValues(value: number | string | boolean) {
    return (typeof value === 'string') ? `'${encodeURIComponent(value)}'` : value;
  }

  /**
   * Build got request options from defined options
   * @param path request path
   * @param method request method
   * @param warpToken the X-Warp10-Token, if any
   */
  private getOptions(path: string, method: string = 'GET', warpToken?: string): any {
    return {
      hostname: this.endpoint.hostname,
      port: this.endpoint.port,
      path,
      method,
      bodyTimeout: this.timeoutOptions,
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
        'X-Warp10-Token': warpToken || ''
      }
    }
  }

  /**
   *
   * @param warpscript
   */
  exec(warpscript: string) {
    return new Promise<{ result: any[], meta: { elapsed: number, ops: number, fetched: number } }>(async (resolve, reject) => {
      try {
        const {headers, body} = await this.send(this.getOptions(`/api/v0/exec`, 'POST'), warpscript) as any;
        resolve({
          result: JSON.parse(body),
          meta: {
            elapsed: parseInt((headers['x-warp10-elapsed'] || ['0'])[0], 10),
            ops: parseInt((headers['x-warp10-ops'] || ['0'])[0], 10),
            fetched: parseInt((headers['x-warp10-fetched'] || ['0'])[0], 10)
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   *
   * @param readToken
   * @param className
   * @param labels
   * @param start
   * @param stop
   * @param format
   * @param dedup
   */
  fetch(readToken: string, className: string, labels: object, start: string, stop: any, format: 'text' | 'fulltext' | 'json' | 'tsv' | 'fulltsv' | 'pack' | 'raw' = 'fulltext', dedup = true) {
    const params = new URLSearchParams([]);
    params.set('selector', encodeURIComponent(className) + this.formatLabels(labels));
    params.set('format', format);
    params.set('dedup', '' + dedup);
    if (typeof stop === 'string') {
      params.set('start', start);
      params.set('stop', stop);
    }
    if (typeof stop === 'number') {
      params.set('now', start);
      params.set('timespan', '' + stop);
    }
    return new Promise<{ result: string[], meta: { elapsed: number, ops: number, fetched: number } }>(async (resolve, reject) => {
      try {
        const {headers, body} = await this.send(this.getOptions(`/api/v0/fetch?${params.toString()}`, 'GET', readToken)) as any;
        resolve({
          result: body.split('\n'),
          meta: {
            elapsed: parseInt((headers['x-warp10-elapsed'] || ['0'])[0], 10),
            ops: parseInt((headers['x-warp10-ops'] || ['0'])[0], 10),
            fetched: parseInt((headers['x-warp10-fetched'] || ['0'])[0], 10)
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   *
   * @param writeToken
   * @param datapoints
   */
  update(writeToken: string, datapoints: (DataPoint | string)[]) {
    const payload = datapoints.map(d => {
      let pos = '';
      if (typeof d === 'string') {
        return d;
      } else {
        if (d.lat && d.lng) {
          pos = `${d.lat}:${d.lng}`;
        }
        return `${d.timestamp || dayjs.utc().valueOf() * 1000}/${pos}/${d.elev || ''} ${d.className}${this.formatLabels(d.labels)} ${Warp10.formatValues(d.value)}`;
      }
    });
    return new Promise<{ response: string | undefined, count: number }>(async (resolve, reject) => {
      try {
        const opts = this.getOptions(`/api/v0/update`, 'POST', writeToken);
        const {body} = await this.send(opts, payload.join('\n')) as any;
        resolve({response: body, count: payload.length});
      } catch (error) {
        reject({error, payload});
      }
    });
  }

  /**
   *
   * @param deleteToken
   * @param className
   * @param labels
   * @param start
   * @param end
   * @param deleteAll
   */
  delete(deleteToken: string, className: string, labels: object, start: string, end: string, deleteAll = false) {
    const params = new URLSearchParams([]);
    params.set('selector', encodeURIComponent(className) + this.formatLabels(labels));
    if (deleteAll) {
      params.set('deleteall', '' + true);
    } else {
      let startM = dayjs.utc(start);
      let endM = dayjs.utc(end);
      if (startM.isAfter(endM)) {
        startM = dayjs.utc(end);
        endM = dayjs.utc(start);
      }
      params.set('start', (startM.valueOf() * 1000) + '');
      params.set('end', (endM.valueOf() * 1000) + '');
    }
    return new Promise<{ result: string }>(async (resolve, reject) => {
      try {
        const {body} = await this.send(this.getOptions(`/api/v0/delete?${params.toString()}`, 'GET', deleteToken)) as any;
        resolve({result: body});
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   *
   * @param writeToken
   * @param meta
   */
  meta(writeToken: string, meta: { className: string, labels: object, attributes: object }[]) {
    const payload = meta.map(m => encodeURIComponent(m.className) + this.formatLabels(m.labels) + this.formatLabels(m.attributes));
    return new Promise<{ response: string, count: number }>(async (resolve, reject) => {
      try {
        const {body} = await this.send(this.getOptions(`/api/v0/meta`, 'POST', writeToken), payload.join('\n')) as any;
        resolve({response: body, count: payload.length});
      } catch (error) {
        reject(error);
      }
    });
  }

  setTimeout(to: number) {
    this.timeoutOptions = to;
  }
}
