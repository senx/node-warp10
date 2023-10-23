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
'use strict'
import {DataPoint} from './DataPoint';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {URL, URLSearchParams} from "url";
import https, {RequestOptions as httpsRequestOpts} from "https";
import http, {RequestOptions as httpRequestOpts} from "http";
import {Logger} from "./logger";

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
  private LOG: Logger;

  /**
   * Create new Warp 10 connector.
   *
   * @param endpoint - Warp 10 endpoint, without <code>/api/v0</code> at the end.
   * @param debug - Enable debug
   */
  constructor(endpoint: string, debug = false) {
    // remove trailing slash if any
    this.url = endpoint.replace(/\/+$/, '');
    this.options.headers = {'Content-Type': 'text/plain; charset=UTF-8', 'X-Warp10-Token': ''};
    this.client = this.url.startsWith('https') ? https : http;
    this.endpoint = new URL(endpoint);
    this.LOG = new Logger(Warp10, debug);
    this.LOG.debug(['constructor'], {endpoint, debug});
  }

  private async send(options: httpsRequestOpts | httpRequestOpts, data?: any): Promise<any> {
    this.LOG.debug(['send'], {options, data});
    let body: string = '';
    return new Promise((resolve, reject) => {
      const req: any = this.client.request(options, (res: any) => {
        res.on("data", (chunk: any) => body += chunk);
        res.on("error", (err: any) => reject(err));
        res.on("end", () => {
          try {
            this.LOG.debug(['send', 'result'], {body, headers: res.headers});
            resolve({body, headers: res.headers});
          } catch (err) {
            reject(err);
          }
        });
      });
      req.on("error", (err: any) => {
        this.LOG.error(['send', 'error'], err);
        reject(err);
      });
      req.on('timeout', (err: any) => {
        this.LOG.error(['send', 'timeout'], err);
        req.abort();
        reject(err);
      });
      req.on('uncaughtException', (err: any) => {
        this.LOG.error(['send', 'uncaughtException'], err);
        req.abort();
        reject(err);
      });
      if (data) {
        req.write(data);
      }
      // end the request to prevent ECONNRESET and socket hung errors
      req.end(() => {
      });
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
   *
   * @param path - request path
   * @param method - request method
   * @param warpToken - the X-Warp10-Token, if any
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
   * Execute a WarpScript against a Warp 10 instance
   *
   * @param warpScript - WarpScript to execute
   *
   * @example
   * ```
   *  // Prints "[4]":
   *  console.log(await w10.exec('2 2 +'))
   * ```
   */
  async exec(warpScript: string): Promise<{ result: any[], meta: { elapsed: number, ops: number, fetched: number } }> {
    const {headers, body} = await this.send(this.getOptions(`/api/v0/exec`, 'POST'), warpScript) as any;
    return {
      result: JSON.parse(body),
      meta: {
        elapsed: parseInt((headers['x-warp10-elapsed'] || ['0'])[0], 10),
        ops: parseInt((headers['x-warp10-ops'] || ['0'])[0], 10),
        fetched: parseInt((headers['x-warp10-fetched'] || ['0'])[0], 10)
      }
    }
  }

  /**
   * Fetch data against a Warp 10 instance
   *
   * @param readToken - Read token
   * @param className - ClassName, could be a regexp starting with '\~' (ie: '~io.warp10.*' )
   * @param labels - Labels key value map. Could be a regexp starting with '\~' (ie: \{ 'myLabel': '~sensor_.*' \} )
   * @param start - ISO8601 UTC Date or UTC timstamp (in platform timeunit format)
   * @param stop - ISO8601 UTC Date if 'start' is a ISO8601 date. Timespan (in platform timeunit format) if 'start' is a timestamp
   * @param format - Output format: text' | 'fulltext' | 'json' | 'tsv' | 'fulltsv' | 'pack' | 'raw', default is 'json'
   * @param dedup - Deduplicates data (default is true)
   *
   * @example
   * ```
   * // fetch raw data between 2 dates
   * console.log(await w10.fetch(readToken, '~io.warp10.*', {}, '2019-11-11T12:34:43.388409Z', '2019-11-21T12:34:43.388409Z', 'json'));
   *
   * // Fetch data with a time span
   * console.log(await w10.fetch(readToken, '~.*', {}, '2019-11-21T12:34:43.388409Z', 86400000000 * 5));
   * ```
   */
  async fetch(readToken: string, className: string, labels: object, start: string, stop: any, format: 'text' | 'fulltext' | 'json' | 'tsv' | 'fulltsv' | 'pack' | 'raw' = 'json', dedup = true): Promise<{
    result: any[],
    meta: { elapsed: number, ops: number, fetched: number }
  }> {
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
    const {
      headers,
      body
    } = await this.send(this.getOptions(`/api/v0/fetch?${params.toString()}`, 'GET', readToken)) as any;
    return {
      result: format === 'json' ? JSON.parse(body) : body.split('\n'),
      meta: {
        elapsed: parseInt((headers['x-warp10-elapsed'] || ['0'])[0], 10),
        ops: parseInt((headers['x-warp10-ops'] || ['0'])[0], 10),
        fetched: parseInt((headers['x-warp10-fetched'] || ['0'])[0], 10)
      }
    };
  }

  /**
   * Update datapoints
   *
   * @param writeToken - Write token
   * @param datapoints - Datapoints to update
   *
   * @example
   * ```
   * console.log(await w10.update(writeToken, [
   *    {timestamp: moment.utc().valueOf() * 1000, className: 'io.warp10.test', labels: {key: 'value'}, value: 54},
   *    '1380475081000000// io.warp10.test{key=value} T',
   *    '1566893344654882/48.81:-4.147/124 io.warp10.test{key=value} [8.2 151 152 1568189745655509/40.6:-74/14 ]',
   *  ]));
   * ```
   */
  async update(writeToken: string, datapoints: (DataPoint | string)[]): Promise<{
    response: string | undefined,
    count: number
  }> {
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
    const opts = this.getOptions(`/api/v0/update`, 'POST', writeToken);
    const {body} = await this.send(opts, payload.join('\n')) as any;
    return {response: body, count: payload.length};
  }

  /**
   *
   * @param deleteToken - Delete token
   * @param className - ClassName, could be a regexp starting with '\~' (ie: '~io.warp10.*' )
   * @param labels - Labels key value map. Could be a regexp starting with '\~' (ie: \{ 'myLabel': '~sensor_.*' \} )
   * @param start - ISO8601 UTC Date
   * @param end - ISO8601 UTC Date
   * @param deleteAll - Default is 'false'
   *
   * @example
   * ```
   * // delete data between 2 dates
   * console.log(await w10.delete(deleteToken, '~io.warp10.test*', {key: 'value'}, '2019-11-11T12:34:43.388409Z', '2019-11-21T12:34:43.388409Z'));
   *
   * // delete all
   * console.log(await w10.delete(deleteToken, '~io.warp10.test*', {key: 'value'}, '', '', true));
   * ```
   *
   */
  async delete(deleteToken: string, className: string, labels: object, start: string, end: string, deleteAll = false): Promise<{
    result: string
  }> {
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
    const {body} = await this.send(this.getOptions(`/api/v0/delete?${params.toString()}`, 'GET', deleteToken)) as any;
    return {result: body};
  }

  /**
   * Update Meta
   * @param writeToken - Write token
   * @param meta - Metadata key value map to update
   *
   * @example
   * ```
   * // write meta
   *   console.log(await w10.meta(writeToken, [{
   *     className: 'io.warp10.test',
   *     labels: {key: 'value'},
   *     attributes: {attr: 'value'}
   *   }]));
   * ```
   */
  async meta(writeToken: string, meta: { className: string, labels: object, attributes: object }[]): Promise<{
    response: string,
    count: number
  }> {
    const payload = meta.map(m => encodeURIComponent(m.className) + this.formatLabels(m.labels) + this.formatLabels(m.attributes));
    const {body} = await this.send(this.getOptions(`/api/v0/meta`, 'POST', writeToken), payload.join('\n')) as any;
    return {response: body, count: payload.length};
  }
}
