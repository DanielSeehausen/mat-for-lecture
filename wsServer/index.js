var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port: 8080})

const ROWCOUNT = 15
const COLCOUNT = 15
const DEFAULTMATRIX = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]
const DEFAULTPLAYERSDATA = [
  [1,  'blue',   [0, 0]],
  [2,  'red',    [0, 3]],
  [3,  'yellow', [0, 6]],
  [4,  'grey',   [0, 9]],
  [5,  'purple', [4, 0]],
  [6,  'cyan',   [4, 3]],
  [7,  'orange', [4, 6]],
  [8,  'pink',   [4, 9]],
  [9,  'black',  [9, 0]],
  [10, 'green',  [9, 3]],
  [11, 'violet', [9, 6]],
  [12, 'white',  [9, 9]]
]
const PLAYERIDSTOCOLOR = DEFAULTPLAYERSDATA.map(pArr => ({id: pArr[1]}))

const playerStartData = DEFAULTPLAYERSDATA.slice().reverse()
const gameMat = DEFAULTMATRIX.map(row => row.slice())
const members = new Set()
function emit(type, data) {
  members.forEach(ws => {
    ws.send(JSON.stringify({action: type, data: data}))
  })
}

wss.on('connection', (ws, req) => {
    const ip = req.connection.remoteAddress
    console.log(ip, 'attempting to connect...');
    if (playerStartData.length === 0) {
      ws.close()
      return
    }
    console.log(ip, '...done!');
    members.add(ws)
    var [id, color, currPos] = playerStartData.pop()
    gameMat[currPos[0]][currPos[1]] = id
    ws.send(JSON.stringify({action: 'init', data: {startPos: currPos, id: id, color: color, mat: gameMat, rowCount: ROWCOUNT, colCount: COLCOUNT, playerColors: PLAYERIDSTOCOLOR}}))
    emit('matrix', gameMat)

    ws.on('message', (payload) => {
      const msg = JSON.parse(payload)
      console.log("\n", ip, " received" , payload)
      if (msg.action === 'move') {
        gameMat[msg.data[0]][msg.data[1]] = id
        gameMat[currPos[0]][currPos[1]] = 0
        currPos = msg.data
        emit('matrix', gameMat)
        ws.send(JSON.stringify({action: 'playerPos', data: [msg.data[0], msg.data[1]]}))
      }
    })

    ws.on('close', () => {
      members.delete(ws)
      gameMat[currPos[0]][currPos[1]] = 0
      console.log(ip, 'disconnected');
    })

})
