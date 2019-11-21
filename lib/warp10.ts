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
import * as got from "got";
import * as moment from "moment";

/**
 *
 */
export class Warp10 {

  private url: string;

  /**
   *
   * @param url
   */
  constructor(url: string) {
    this.url = url;
  }

  private formatLabels(labels: any) {
    return `{${Object.keys(labels).map(k => `${k}=${encodeURIComponent(`${labels[k]}`)}`)}}`
  }

  private static formatValues(value: number | string | boolean) {
    return (typeof value === 'string') ? encodeURIComponent(value) : value;
  }

  /**
   *
   * @param warpscript
   */
  exec(warpscript: string) {
    return new Promise<{ result: any[], meta: { elapsed: number, ops: number, fetched: number } }>((resolve, reject) => {
      got.post(`${this.url.replace(/^\/+/, '')}/api/v0/exec`, {
        body: warpscript,
      },).then(response => {
        resolve({
          result: JSON.parse(response.body),
          meta: {
            elapsed: parseInt((response.headers['x-warp10-elapsed'] || ['0'])[0], 10),
            ops: parseInt((response.headers['x-warp10-ops'] || ['0'])[0], 10),
            fetched: parseInt((response.headers['x-warp10-fetched'] || ['0'])[0], 10)
          }
        });
      }).catch(error => {
        reject(!!error.response ? error.response.body : error);
      });
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
    return new Promise<{ result: string[], meta: { elapsed: number, ops: number, fetched: number } }>((resolve, reject) => {
      got.get(`${this.url.replace(/^\/+/, '')}/api/v0/fetch?${params.toString()}`, {
        headers: {'Content-Type': 'text/plain', 'x-warp10-token': readToken}
      }).then(response => {
        resolve({
          result: response.body.split('\n'),
          meta: {
            elapsed: parseInt((response.headers['x-warp10-elapsed'] || ['0'])[0], 10),
            ops: parseInt((response.headers['x-warp10-ops'] || ['0'])[0], 10),
            fetched: parseInt((response.headers['x-warp10-fetched'] || ['0'])[0], 10)
          }
        });
      }).catch(error => {
        reject(!!error.response ? error.response.body : error);
      });
    });
  }

  /**
   *
   * @param writeToken
   * @param datapoints
   */
  update(writeToken: string, datapoints: ({
    timestamp?: number,
    lat?: number
    lng?: number
    elev?: number
    className: string;
    value: number | string | boolean;
    labels: object
  } | string)[]) {
    const payload = datapoints.map(d => {
      let pos = '';
      if (typeof d === 'string') {
        return d;
      } else {
        if (d.lat && d.lng) {
          pos = `${d.lat}:${d.lng}`;
        }
        return `${d.timestamp || moment.utc().valueOf() * 1000}/${pos}/${d.elev || ''} ${d.className}${this.formatLabels(d.labels)} ${Warp10.formatValues(d.value)}`;
      }
    });
    return new Promise<{ response: string, count: number }>((resolve, reject) => {
      got.post(`${this.url.replace(/^\/+/, '')}/api/v0/update`, {
        body: payload.join('\n'),
        headers: {'Content-Type': 'text/plain', 'x-warp10-token': writeToken}
      },).then(response => {
        resolve({response: response.body, count: payload.length});
      }).catch(error => {
        reject(!!error.response ? error.response.body : error);
      });
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
      let startM = moment.utc(start);
      let endM = moment.utc(end);
      if (startM.isAfter(endM)) {
        startM = moment.utc(end);
        endM = moment.utc(start);
      }
      params.set('start', (startM.valueOf() * 1000) + '');
      params.set('end', (endM.valueOf() * 1000) + '');
    }
    return new Promise<{ result: string }>((resolve, reject) => {
      got.get(`${this.url.replace(/^\/+/, '')}/api/v0/delete?${params.toString()}`, {
        headers: {'Content-Type': 'text/plain', 'x-warp10-token': deleteToken}
      }).then(response => {
        console.log(response.body, response.headers);
        resolve({result: response.body});
      }).catch(error => {
        reject(!!error.response ? error.response.body : error);
      });
    });
  }

  /**
   *
   * @param writeToken
   * @param meta
   */
  meta(writeToken: string, meta: { className: string, labels: object, attributes: object }[]) {
    const payload = meta.map(m => encodeURIComponent(m.className) + this.formatLabels(m.labels) + this.formatLabels(m.attributes));
    return new Promise<{ response: string, count: number }>((resolve, reject) => {
      got.post(`${this.url.replace(/^\/+/, '')}/api/v0/meta`, {
        body: payload.join('\n'),
        headers: {'Content-Type': 'text/plain', 'x-warp10-token': writeToken}
      },).then(response => {
        resolve({response: response.body, count: payload.length});
      }).catch(error => {
        reject(!!error.response ? error.response.body : error);
      });
    });
  }
}
