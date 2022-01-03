class SignalingChannel {
    constructor(token, webRtc) {
        this.token = token
        this.webRtc = webRtc
        this.connection = new EventSource(`/signal/${token}`)
        this.baseUrl = "https://veni.com"

        this.registerEvents()
    }

    registerEvents() {
        this.connection.onopen = () => {
            console.log('connection to stream has been opened')
        }

        this.connection.onerror = (error) => {
            console.log('An error has occurred while receiving stream', error)
        }

        this.connection.onmessage = (stream) => {
            const jsonPayload = JSON.parse(stream.data)
            console.log('received stream', jsonPayload)
        }

        //STREAM COM NOME DO EVENTO
        this.connection.addEventListener("welcome", (stream) => {
            console.log('welcome', stream)
        })

        this.connection.addEventListener("health-check", (stream) => {
            console.log('health-check', stream)
        })

        this.connection.addEventListener("signal", (stream) => {
            console.log('message', stream)
        })
    }

    async sendData(data) {
        const headers = new Headers()
        headers.append("Content-Type", "application/json")

        const body = JSON.stringify({
            data
        }) 

        const requestOptions = {
            method: 'POST',
            headers,
            body: body,
            redirect: 'follow'
        }

        const endpoint = `${this.baseUrl}/signal/${this.token}`

        return await fetch(endpoint, requestOptions)
    }
}