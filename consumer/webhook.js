import { readFileSync } from 'fs';
import {Agent} from 'https';
import axios from "axios";
import { openChannel } from "./channel.js";
import { WebhookCallback } from "./callback.js";
import { getTime } from "./tools.js";

// Fetch json queue parameters, path from root
const queues = JSON.parse(readFileSync('./config.json'));
// Create axios agent
const agent = new Agent({
  // We asume that it's ok in dev environment
  rejectUnauthorized: false
});

class AmpqMessage {
  constructor(object) {
    this.target = object.target;
    this.query = object.query;
    this.request = object.request;
    this.headers = object.headers;
    this.method = object.method;
    this.callback = object.callback;
    this.ip = object.ip;
  }
}

export default {
  /**
   * Connect to rabbitmq webhook queue
   * This function will call
   */
  init: function () {
    openChannel(queues)
      .then(function (channel) {
        for (const queue of queues) {
          console.log(getTime() + '[RABBITMQ] Setup queue ' + queue);

          channel.consume(queue, function (msg) {
            console.log(getTime() + " - Received message from queue " + queue);

            var message = false;
            try {
              message = new AmpqMessage(JSON.parse(msg.content));
            } catch (e) {
              console.error(getTime() + ' - [RABBITMQ] Message parsing error', e.message);
              return;
            }

            if (!message) {
              console.error(getTime() + ' - [RABBITMQ] Message is empty');
              return;
            }

            // Check message integrity, it should contain all required fields
            for (const prop of ['target', 'query', 'request', 'headers', 'method', 'callback', 'ip']) {
              if (!message.hasOwnProperty(prop)) {
                console.error(getTime() + ' - [RABBITMQ] Message does not contain "'+prop+'" field');
                return;
              }
            }

            let query = new URLSearchParams(message.query);
            query = '?' + query.toString();
            let request = message.request;
            message.headers['X-ORIGINAL-IP'] = message.ip;
            if (message.headers.host instanceof Array) {
              message.headers.host = message.headers.host[0];
            }
            console.log(getTime() + " - [x] " + message.method + " Forward to " + message.target + query);

            // Update trace
            WebhookCallback(message.callback, {state: 'received'});

            let data = {
              method: message.method,
              url: message.target + query,
              data: request,
              httpsAgent: agent,
              headers: message.headers,
            };
            // Purge probematic data
            delete data.headers.host;
            delete data.headers.connection;
            delete data.headers['content-length'];
            delete data.headers['content-type'];

            axios(data)
              .then(function (response) {
                console.debug(getTime() + '[webhook consumer '+queue+']', response.status)

                // Push response to webhook
                WebhookCallback(message.callback, {
                  state: 'succeeded',
                  code: response.status,
                  message: JSON.stringify(response.data)
                });
              })
              .catch(function (e) {
                console.error(
                  getTime() + '[webhook consumer '+queue+'] [ERROR]',
                  e.response ? e.response.status : 'no response status',
                  e.response ? e.response.message : 'no response message',
                  e.response ? JSON.stringify(e.response.data) : 'no response data',
                );

                // Push e to webhook
                WebhookCallback(message.callback, {
                  state: 'error',
                  code: e.response?.status,
                  message: e.response?.message,
                });
              })
            ;
          }, {
            noAck: true
          });
        }
      })
      .catch(function (e) {
        console.log(getTime() + '[RABBITMQ] Setup queue error ', e);
      })
    ;
  }
}
