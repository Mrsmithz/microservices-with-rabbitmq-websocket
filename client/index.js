const axios = require('axios')
const uuid = require('uuid')
const socketIO = require('socket.io-client')

const socket = socketIO('http://localhost:8889/message')
async function test(){
    try{
        let socketId = uuid.v4()
        let result = await axios.post('http://localhost:8889/service1', {
            socketId:socketId,
            message:"from test client"
        })
        console.log(result.data, 'response')
        socket.on(socketId, data => {
            console.log(data)
        })
    }
    catch(err){
        console.log(err)
    }
}

test()