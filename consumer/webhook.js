import { readFileSync } from 'fs';
import {Agent} from 'https';
import axios from "axios";
import { openChannel } from "./channel.js";

// Fetch json queue parameters, path from root
const queues = JSON.parse(readFileSync('./config.json'));
// Create axios agent
const agent = new Agent({
  // We asume that it's ok in dev environment
  rejectUnauthorized: false
});

export default {
  /**
   * Connect to rabbitmq webhook queue
   * This function will call
   */
  init: function () {
    openChannel(queues)
      .then(function (channel) {
        for (const [queue, url] of Object.entries(queues)) {
          console.log('[RABBITMQ] Setup queue ' + queue + ' will route to ' + url);

          channel.consume(queue, function (msg) {
            let message = JSON.parse(msg.content);
            let query = new URLSearchParams(message.query);
            query = '?' + query.toString();
            let request = message.request;
            message.headers['X-ORIGINAL-IP'] = message.ip;
            if (message.headers.host instanceof Array) {
              message.headers.host = message.headers.host[0];
            }
            console.log("[x] Forward to " + url + query);

            axios({
              method: message.method,
              url: url + query,
              data: request,
              httpsAgent: agent,
              headers: message.headers,
            })
              .then(function (response) {
                console.debug('[webhook consumer]', response.status)
              })
              .catch(function (error) {
                console.error(
                  '[webhook consumer] [ERROR]',
                  error.message, error.response, error
                );

                // Push error to webhook
              })
            ;
          }, {
            noAck: true
          })
        }
      })
      .catch(function (e) {
        console.log('[RABBITMQ] Setup queue ' + queue + ' error ', e);
      })
    ;
  }
}
