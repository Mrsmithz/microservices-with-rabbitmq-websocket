const express = require('express')
const logger = require('morgan')
const amqpClient = require('./amqpClient')
const app = express()

app.use(logger('dev'))
app.use(express.json())


let channel
amqpClient.createClient({url:process.env.RABBIT_URL})
    .then(ch => {
        channel = ch;
    })


app.post('/service1', (req, res) => {
    const q1 = 'service_1'
    amqpClient.sendRPCMessage(channel, JSON.stringify(req.body), q1)
        .then(msg => {
            res.send(msg)
        })
})

app.get('/service2', (req, res) => {
    const q2 = 'service_2'
    amqpClient.sendRPCMessage(channel, req.body, q2)
        .then(msg => {
            res.send(msg)
        })
})

const PORT = process.env.PORT || 8889

const server = app.listen(PORT, () => {
    console.log(`server started at port ${PORT}`)
})

const socket = require('socket.io')(server)

const event = socket.of('/message')
event.on('connection', client => {
    console.log('socket connected')
})

const socketObject = event

module.exports.socketObject = socketObject