var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port: 8080})
var Game = require('./game.js')

const game = new Game()

wss.on('connection', (ws, req) => {
    const ip = req.connection.remoteAddress
    console.log(ip, 'attempting to connect...');
    const player = game.addPlayer(ws, ip)

    if (player) {
      console.log(`...${ip} successfully connected`);
    } else {
      console.log(`...${ip} rejected: game full`);
      ws.send(JSON.stringify({action: error, data: "Game Full!"}))
      ws.close()
      return
    }

    ws.on('message', (payload) => {
      const msg = JSON.parse(payload)
      console.log("RECEIVED: ", ip, ": ", payload)
      if (msg.action === 'move') {
        game.move(player, msg.direction)
      }
    })

    ws.on('close', () => {
      members.delete(ws)
      gameMat[currPos[0]][currPos[1]] = 0
      console.log(ip, 'disconnected');
    })

})
