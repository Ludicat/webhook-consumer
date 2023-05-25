import { connect } from 'amqplib/callback_api.js';
import config from '../config.js'

export const openChannel = function (queues) {
    let host = config.RABBITMQ_PROTOCOL 
        + '://'
        + config.RABBITMQ_USER
        + ':'
        + config.RABBITMQ_PASS
        + '@'
        + config.RABBITMQ_HOST
        + ':'
        + config.RABBITMQ_PORT
        +'/'
        // It's vhost value, but here it's the same as username for convinience
        + config.RABBITMQ_USER
    ;
    
    console.log('[RABBITMQ] Connecting to ' + host + '...');
    
    return new Promise(function (resolve, reject) {
        connect(host, function (error0, connection) {
            if (error0) {
                return reject(error0);
            }

            connection.createChannel(function (error1, channel) {
                if (error1) {
                    return reject(error1);
                }

                for (let i in queues) {
                    channel.assertQueue(queues[i], {
                        durable: true,
                        autoDelete: false
                    });
                }

                resolve(channel);
            });
        });
    })
}
