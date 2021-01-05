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
import got, {Options} from 'got';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {URLSearchParams} from "url";

dayjs.extend(utc)

/**
 *
 */
export class Warp10 {

  private url: string;
  private options: Options = {};
  private timeoutOptions: any = {};

  /**
   * Create new Warp 10™ connector.
   *
   * @param url Warp 10 endpoint, without '/api/v0' at the end.
   * @param requestTimeout
   * @param connectTimeout
   * @param retry
   */
  constructor(url: string, requestTimeout?: number, connectTimeout?: number, retry?: number) {
    // remove trailing slash if any
    this.url = url.replace(/\/+$/, '');
    this.setTimeout(requestTimeout, connectTimeout, retry);
    this.options.headers = {'Content-Type': 'text/plain; charset=UTF-8', 'X-Warp10-Token': ''};
  }

  private formatLabels(labels: any) {
    return `{${Object.keys(labels).map(k => `${k}=${encodeURIComponent(`${labels[k]}`)}`)}}`
  }

  private static formatValues(value: number | string | boolean) {
    return (typeof value === 'string') ? `'${encodeURIComponent(value)}'` : value;
  }

  /**
   * Exposed for unit tests and dynamic adjustment on embedded systems
   * @param requestTimeout from socket opened to answer request. Default is no limit.
   * @param connectTimeout lookup + connect phase + https handshake. Default is 10 seconds.
   * @param retry number of retry to do the request. Default is 1.
   */
  setTimeout(requestTimeout?: number, connectTimeout?: number, retry?: number) {
    this.timeoutOptions.connect = connectTimeout || 10000;
    this.timeoutOptions.secureConnect = connectTimeout || 10000;
    this.timeoutOptions.lookup = connectTimeout || 10000;
    this.timeoutOptions.socket = connectTimeout || 10000;
    this.timeoutOptions.response = requestTimeout || undefined;
    this.options.timeout = this.timeoutOptions;
    this.options.retry = retry || 1;
  }

  /**
   * Build got request options from defined options
   * @param body the got request payload
   * @param warpToken the X-Warp10-Token, if any
   */
  private getOptions(body?: string, warpToken?: string): Options {
    return {
      retry: this.options.retry,
      timeout: this.timeoutOptions,
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
        'X-Warp10-Token': warpToken || ''
      },
      body
    }
  }

  /**
   *
   * @param warpscript
   */
  exec(warpscript: string) {
    return new Promise<{ result: any[], meta: { elapsed: number, ops: number, fetched: number } }>(async (resolve, reject) => {
      try {
        const response = await got.post(`${this.url}/api/v0/exec`, this.getOptions(warpscript)) as any;
        resolve({
          result: JSON.parse(response.body),
          meta: {
            elapsed: parseInt((response.headers['x-warp10-elapsed'] || ['0'])[0], 10),
            ops: parseInt((response.headers['x-warp10-ops'] || ['0'])[0], 10),
            fetched: parseInt((response.headers['x-warp10-fetched'] || ['0'])[0], 10)
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
        const response = await got.get(`${this.url}/api/v0/fetch?${params.toString()}`, this.getOptions(undefined, readToken)) as any;
        resolve({
          result: response.body.split('\n'),
          meta: {
            elapsed: parseInt((response.headers['x-warp10-elapsed'] || ['0'])[0], 10),
            ops: parseInt((response.headers['x-warp10-ops'] || ['0'])[0], 10),
            fetched: parseInt((response.headers['x-warp10-fetched'] || ['0'])[0], 10)
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
    return new Promise<{ response: string, count: number }>(async (resolve, reject) => {
      try {
        const response = await got.post(`${this.url}/api/v0/update`, this.getOptions(payload.join('\n'), writeToken)) as any;
        resolve({response: response.body, count: payload.length});
      } catch (error) {
        reject(error);
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
        const response = await got.get(`${this.url}/api/v0/delete?${params.toString()}`, this.getOptions(undefined, deleteToken)) as any;
        resolve({result: response.body});
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
        const response = await got.post(`${this.url}/api/v0/meta`, this.getOptions(payload.join('\n'), writeToken)) as any;
        resolve({response: response.body, count: payload.length});
      } catch (error) {
        reject(error);
      }
    });
  }
}
