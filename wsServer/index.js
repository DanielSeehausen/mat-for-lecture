var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port: 8080})

const MATRIX = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]

const startPositions = [
  [0, 3],
  [0, 6],
  [0, 9],
  [2, 3],
  [2, 6],
  [2, 9],
  [4, 3],
  [4, 6],
  [4, 9],
  [6, 3],
  [6, 6],
  [6, 9],
  [8, 3],
  [8, 6],
  [8, 9]
]
const playerVals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].reverse()
// const gameMat = MATRIX.map(row => row.slice())
const members = new Set()

function emit(type, data) {
  members.forEach(ws => {
    ws.send(JSON.stringify({action: type, data: data}))
  })
}

wss.on('connection', (ws, req) => {
    const ip = req.connection.remoteAddress
    console.log(ip, 'connected');

    members.add(ws)
    let pos = startPositions.pop()
    const val = playerVals.pop()
    MATRIX[pos[0]][pos[1]] = val
    ws.send(JSON.stringify({action: 'init', data: {pos: pos, val: val}}))
    emit('matrix', MATRIX)

    ws.on('message', (payload) => {
      const msg = JSON.parse(payload)
      console.log("\nreceived", payload)
      if (msg.action === 'move') {
        MATRIX[msg.data[0]][msg.data[1]] = val
        MATRIX[pos[0]][pos[1]] = 0
        pos = msg.data
        MATRIX.forEach(m => console.log(m))
        emit('matrix', MATRIX)
        ws.send(JSON.stringify({action: 'playerPos', data: [msg.data[0], msg.data[1]]}))
      }
    })

    ws.on('close', () => {
      members.delete(ws)
      MATRIX[pos[0]][pos[1]] = 0
      console.log(ip, 'disconnected');
    })

})
