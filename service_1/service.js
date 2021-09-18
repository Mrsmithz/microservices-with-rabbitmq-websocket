require('dotenv').config()
const amqp = require('amqplib')

const q = 'service_1'
amqp.connect(process.env.RABBIT_URL)
    .then(conn => conn.createChannel())
    .then(ch => {
        ch.assertQueue(q, {durable:false})
        ch.prefetch(1)
        console.log("[x] Awaiting RPC Requests")

        ch.consume(q, msg => {
            // const message = `from ${q}, message is : ${msg.content.toString()}`
            let obj = JSON.parse(msg.content.toString())
            console.log(`get message : ${msg.content.toString()}`)
            for (let i=0;i<10;i++){
                let response = {
                    socketId:obj.socketId,
                    message:`from service 1 your msg : ${obj.message} ${i}`
                }
                ch.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {correlationId:msg.properties.correlationId})
            }
            ch.ack(msg)
        })
    })