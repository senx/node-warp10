/*
 * Copyright 2020-2023 SenX S.A.S.
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

dayjs.extend(utc);

export enum TimeUnits {
  US = 1000, MS = 1, NS = 1000000
}

export interface GTS {
  c: string,
  v: any[],
  a: { [key: string]: string },
  l: { [key: string]: string },
  la: number
}

export interface W10Data {
  ts: number,
  value: any,
  loc?: { lat: number, long: number },
  elev?: number
}

export interface FormattedGTS {
  name: string,
  labels: { [key: string]: string },
  attributes: { [key: string]: string },
  data: W10Data[]
}

/**
 *
 */
export class Warp10 {

  private url: string | undefined;
  private client: any;
  private LOG: Logger;
  private _endpoint: URL | undefined;
  private _timeUnit: TimeUnits | undefined;
  private _headers?: { [key: string]: string } = {};
  private _timeout = 0;

  /**
   * Create new Warp 10 connector.
   *
   * @param params - \{ endpoint: string; debug?: boolean; silent?: boolean, timeUnit: TimeUnits \}
   * endpoint - Warp 10 endpoint, without <code>/api/v0</code> at the end.
   * debug - Enable debug
   * silent - Do not produce logs
   * timeUnit - Platform timeUnit @see TimeUnits
   * headers - custom HTTP headers
   * timeout - http Timeout
   *
   * @example
   * ```
   * // standard constructor
   * const w10 = new Warp10({endpoint: 'https://sandbox.senx.io'});
   * // builder pattern
   * const w10 = new Warp10().endpoint('https://sandbox.senx.io').timeUnit(TimeUnits.US);
   * ```
   */
  constructor(params?: {
    endpoint?: string;
    debug?: boolean;
    silent?: boolean,
    timeUnit?: TimeUnits,
    headers?: { [key: string]: string },
    timeout?: number
  }) {
    this.LOG = new Logger(Warp10, params?.debug, params?.silent);
    if (params?.endpoint != null) this.endpoint(params.endpoint);
    this.timeUnit(params?.timeUnit ?? TimeUnits.US);
    this.headers(params?.headers ?? {});
    if (params?.timeout != null) {
      this.timeout(params?.timeout);
    }
    this.LOG.debug(['constructor'], params);
  }

  endpoint(endpoint: string | undefined) {
    if (endpoint == null) throw new Error('Endpoint is mandatory');
    // remove trailing slash if any
    this.url = (endpoint ?? '').replace(/\/+$/, '');
    this.client = this.url.startsWith('https') ? https : http;
    this._endpoint = new URL(endpoint ?? '');
    return this;
  }

  headers(headers: { [key: string]: string }) {
    this._headers = headers ?? {};
    return this;
  }

  debug(debug: boolean) {
    this.LOG.isDebug = debug;
    return this;
  }

  silent(silent: boolean) {
    this.LOG.silent = silent;
    return this;
  }

  timeUnit(timeUnit: TimeUnits) {
    this._timeUnit = timeUnit ?? TimeUnits.US;
    return this;
  }

  timeout(to: number) {
    if (to) {
      this._timeout = to;
    }
    return this;
  }

  private async send(options: httpsRequestOpts | httpRequestOpts, data?: any): Promise<any> {
    this.LOG.debug(['send'], {options, data});
    let body: string = '';
    if (!this.client) throw new Error('Warp10Lib is misconfigured, probably a wrong ort missing endpoint value.');
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
        this.LOG.warn(['send', 'timeout'], err);
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
      req.end(() => {
        // end the request to prevent ECONNRESET and socket hung errors
      });
    });
  }

  /**
   * Build got request options from defined options
   *
   * @param path - request path
   * @param method - request method
   * @param warpToken - the X-Warp10-Token, if any
   */
  private getOptions(path: string, method: string = 'GET', warpToken?: string): any {
    if (!this._endpoint) throw new Error('Missing endpoint');
    const opts = {
      hostname: this._endpoint.hostname,
      port: this._endpoint.port,
      path,
      method,
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
        'X-Warp10-Token': warpToken || '',
        ...this._headers
      }
    } as any;
    if (this._timeout > 0) opts.bodyTimeout = this._timeout;
    return opts;

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
        elapsed: parseInt((headers['x-warp10-elapsed'] ?? ['0'])[0], 10),
        ops: parseInt((headers['x-warp10-ops'] ?? ['0'])[0], 10),
        fetched: parseInt((headers['x-warp10-fetched'] ?? ['0'])[0], 10)
      }
    }
  }

  /**
   * Fetch data against a Warp 10 instance
   *
   * @param readToken - Read token
   * @param className - ClassName, could be a regexp starting with '\~' (ie: '~io.warp10.*' )
   * @param labels - Labels key value map. Could be a regexp starting with '\~' (ie: \{ 'myLabel': '~sensor_.*' \} )
   * @param start - ISO8601 UTC Date
   * @param stop - ISO8601 UTC Date if 'start' is a ISO8601 date. Timespan (in platform timeunit format) if 'start' is a timestamp
   * @param format - Output format: text' | 'fulltext' | 'json' | 'tsv' | 'fulltsv' | 'pack' | 'raw' | 'formatted', default is 'formatted'
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
  async fetch(readToken: string, className: string, labels: {
    [key: string]: string
  }, start: string, stop: any, format: 'text' | 'fulltext' | 'json' | 'tsv' | 'fulltsv' | 'pack' | 'raw' | 'formatted' = 'formatted', dedup = true): Promise<{
    result: any[],
    meta: { elapsed: number, ops: number, fetched: number }
  }> {
    const params = new URLSearchParams([]);
    params.set('selector', encodeURIComponent(className) + this.formatLabels(labels));
    params.set('format', format === 'formatted' ? 'json' : format);
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
    let result: any;
    switch (format) {
      case "json":
        result = JSON.parse(body);
        break;
      case "formatted":
        result = this.formatGTS(JSON.parse(body) ?? []);
        break;
      default:
        result = body.split('\n');
    }
    return {
      result,
      meta: {
        elapsed: parseInt((headers['x-warp10-elapsed'] ?? ['0'])[0], 10),
        ops: parseInt((headers['x-warp10-ops'] ?? ['0'])[0], 10),
        fetched: parseInt((headers['x-warp10-fetched'] ?? ['0'])[0], 10)
      }
    };
  }

  /**
   * Update datapoints
   *
   * @param writeToken - Write token
   * @param dataPoints
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
  async update(writeToken: string, dataPoints: (DataPoint | string)[]): Promise<{
    response: string | undefined,
    count: number
  }> {
    const payload = dataPoints.map(d => {
      let pos = '';
      if (typeof d === 'string') {
        return d;
      } else {
        if (d.lat != null && d.lng != null) {
          pos = `${d.lat}:${d.lng}`;
        }
        return `${d.timestamp ?? dayjs.utc().valueOf() * (this._timeUnit ?? TimeUnits.US).valueOf()}/${pos}/${d.elev ?? ''} ${d.className}${this.formatLabels(d.labels)} ${Warp10.formatValues(d.value)}`;
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
  async delete(deleteToken: string, className: string, labels: {
    [key: string]: string
  }, start: string, end: string, deleteAll = false): Promise<{
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
  async meta(writeToken: string, meta: {
    className: string,
    labels: { [key: string]: string },
    attributes: { [key: string]: string }
  }[]): Promise<{
    response: string,
    count: number
  }> {
    const payload = meta.map(m => encodeURIComponent(m.className) + this.formatLabels(m.labels) + this.formatLabels(m.attributes));
    const {body} = await this.send(this.getOptions(`/api/v0/meta`, 'POST', writeToken), payload.join('\n')) as any;
    return {response: body, count: payload.length};
  }

  private formatLabels(labels: { [key: string]: string }) {
    return `{${Object.keys(labels ?? {}).map(k => `${k}=${encodeURIComponent(`${labels[k]}`)}`)}}`
  }

  private static formatValues(value: number | string | boolean) {
    return (typeof value === 'string') ? `'${encodeURIComponent(value)}'` : value;
  }

  private formatGTS(gtsList: GTS[]): FormattedGTS[] {
    const res: FormattedGTS[] = [];
    const size = (gtsList ?? []).length;
    for (let i = 0; i < size; i++) {
      const gts = gtsList[i];
      const data: W10Data[] = [];
      const vSize = gts.v.length;
      for (let j = 0; j < vSize; j++) {
        const dp: W10Data = {
          ts: gts.v[j][0],
          value: gts.v[j][gts.v[j].length - 1]
        };
        if (gts.v[j].length > 3) {
          dp.loc = {
            lat: gts.v[j][1],
            long: gts.v[j][2]
          };
        }
        if (gts.v[j].length > 4) {
          dp.elev = gts.v[j][3];
        }
        data.push(dp);
      }
      res.push({name: gts.c, labels: gts.l, attributes: gts.a, data});
    }
    return res;
  }
}
