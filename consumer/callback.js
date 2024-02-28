import axios from "axios";
import {Agent} from 'https';

// Create axios agent
const agent = new Agent({
  // We asume that it's ok in dev environment
  rejectUnauthorized: false
});

export const WebhookCallback = async function (url, state) {
  // Update trace
  return await axios({
    method: 'post',
    url: url,
    data: state,
    httpAgent: agent,
    httpsAgent: agent,
    headers: {
      // Send as url encoded
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  })
    .catch(function (e) {
      console.error(
        '[webhook callback] [ERROR]',
        e.response ? e.response.status : 'no response status',
        e.response ? e.response.message : 'no response message',
        e.response ? JSON.stringify(e.response.data) : 'no response data',
      );
    })
  ;
}
