
class WebRtc {
  constructor() {
    this.peerConnections = []
    this.configuration = ICE_SERVERS
  }

  async userMedia () {
    // permissoes dão problema sem dispositivo , ex semn camera
    return await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS)
  }

  addPeerConnectionToList (peerConnection) {
    const lastPeerConnectionListIndex = this.peerConnections.length-1

    peerConnection.peerConnectionIndexList = lastPeerConnectionListIndex
    this.peerConnections.push(peerConnection)
  }

  getLastPeerConnection(){
    const [lastPeerConnection] = arr.slice(-1)

    return lastPeerConnection
  }

  createNewRtcPeerConnection () {
    const newRTCPeerConnection = new RTCPeerConnection(this.configuration)
    
    this.addPeerConnectionToList(newRTCPeerConnection)
  }

  getPeerConnection () {
    return this.getLastPeerConnection() ? 
      this.getLastPeerConnection() : 
      this.createNewRtcPeerConnection()
  }

  // watchEvents () {
  //  const peerConnection = new RTCPeerConnection(configuration);
  //   signalingChannel.addEventListener('message', async message => {
  //     console.log(message)
  //     if (message.offer) {
  //         const remoteDesc = new RTCSessionDescription(message.offer)

  //         this.peerConnection.setRemoteDescription(remoteDesc)
          
  //         const answer = await this.peerConnection.createAnswer()
          
  //         await this.peerConnection.setLocalDescription(answer)
  //         signalingChannel.send({'answer': answer})
  //     }
  //   })
  // }

  async makeCall () {
    const peerConnection = this.getPeerConnection()
    const offer = await peerConnection.createOffer()
  
    await peerConnection.setLocalDescription(offer)
    // registra no rtc e envia para o socket
    // signalingChannel.send({'offer': offer})
  }
}

const MEDIA_CONSTRAINTS = {
  'video': false,
  'audio': true
}

const ICE_SERVERS = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}