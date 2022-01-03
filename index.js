const fs = require('fs')
const http = require('http')
const https = require('https')
const bodyParser = require('body-parser')
const express = require('express')
const { sse } = require('@toverux/expresse')

const privateKey  = fs.readFileSync('selfsigned.key', 'utf8')
const certificate = fs.readFileSync('selfsigned.crt', 'utf8')
const credentials = {key: privateKey, cert: certificate}
const app = express()

const userEvents = {}

addUserEvent = (token, event) => {
    if(!userEvents[token]){
        userEvents[token] = []
    }
    userEvents[token].push(event)
}

getUserEvents = (token) => {
    return userEvents[token] ? userEvents[token] : []
}

clearUserEvents = (token) => {
    delete userEvents[token]
}

app.use(express.static('client'))
app.use(bodyParser.json())

app.get('/signal/:token', sse(/* options */), (req, res) => {
    let messageId = parseInt(req.header('Last-Event-ID'), 10) || 0
    const identity = `${req.params.token} - ${messageId}`
    const payload = {message:`Welcome ${identity}!`}

    res.sse.event('welcome', payload, messageId)
    console.log(`[${req.params.token}] bem vindo`)

    messageId++

    //polling
    setInterval(() => {
        const events = getUserEvents(req.params.token)
        if(events.length){
            console.log(`[${req.params.token}] pegando eventos (${events.length})`, events)
            for(const event of events) {
                res.sse.event('signal', event, messageId++)
                console.log(`[${req.params.token}] evento enviado`, event)
            }
            clearUserEvents(req.params.token)
            console.log(`[${req.params.token}] limpando eventos`)
        }else{
            const payload = {message: `Hello ${identity}!`}
            res.sse.event('health-check', payload, messageId++)
            console.log(`[${req.params.token}] healthchecked`)
        }
    }, 2000)
})

//ADICIONAR HOOK PAR LIGAR/PASSAR MESSAGE
app.post('/signal/:token', (req, res) => {
    if(!req.params.token || !req.body){
        res.status(400).send({message:'nok'})
        return
    }

    addUserEvent(req.params.token, req.body)
    res.status(200).send({message:'ok', events: getUserEvents(req.params.token)})
})

const httpServer = http.createServer(app)
const httpsServer = https.createServer(credentials, app)

httpServer.listen(80)
httpsServer.listen(443)


