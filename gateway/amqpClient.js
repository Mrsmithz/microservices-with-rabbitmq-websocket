require('dotenv').config()
const amqp = require('amqplib')
const uuid = require('uuid')
const REPLY_QUEUE = 'amq.rabbitmq.reply-to';
const EventEmitter = require('events');
const socket = require('./index')

const createClient = (settings) => amqp.connect(settings.url)
    .then(conn => conn.createChannel())
    .then(ch => {
        ch.responseEmitter = new EventEmitter()
        ch.responseEmitter.setMaxListeners(0)
        ch.consume(REPLY_QUEUE, (msg) => {
            //console.log(msg.content.toString())
            let message = JSON.parse(msg.content.toString())
            ch.responseEmitter.emit(msg.properties.correlationId, message)
            socket.socketObject.emit(message.socketId, message)
        }, {noAck:true})
        return ch
    })

const sendRPCMessage = (ch, message, rpcQueue) => new Promise((resolve) => {
    const correlationId = uuid.v4()
    ch.responseEmitter.once(correlationId, resolve)
    ch.sendToQueue(rpcQueue, Buffer.from(message), {correlationId, replyTo:REPLY_QUEUE})
})

module.exports.createClient = createClient;
module.exports.sendRPCMessage = sendRPCMessage;
