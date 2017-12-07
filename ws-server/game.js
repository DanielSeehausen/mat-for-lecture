var config = require('./config.js')
var Player = require('./player.js')

class Game {

  constructor() {
    this.playersData = config.DEFAULTPLAYERSDATA.slice().reverse() // so we can pop efficiently
    this.matrix = config.DEFAULTMATRIX.map(row => row.slice())
    this.members = new Set()
  }

  emit(type, data) {
    this.members.forEach(member => {
      member.ws.send(JSON.stringify({action: type, data: data}))
    })
  }

  // GAME METHODS **************************************************************
  outOfBounds(newLoc) {
    return (newLoc[0] < 0 || newLoc[0] >= this.matrix.length ||
            newLoc[1] < 0 || newLoc[1] >= this.matrix[0].length)
  }

  isValidMove(currPos, direction) {
    const newLoc = [currPos[0] + direction[0], currPos[1] + direction[1]]
    return (!this.outOfBounds(newLoc) && (this.matrix[newLoc[0]][newLoc[1]] === 0)
  }

  movePlayer(player, direction) {

  }

  addPlayer(ws, ip) {
    if (playersData.length) {
      const player = new Player(this, ws, ip, this.playerData.pop())
      this.members.add(player)
      this.emit('matrix', this.matrix)
      return player
    }
    return false
  }

  // MAT METHODS ***************************************************************
  cellSafe(x, y) {
    return (this.matrix[x][y] === 0 && this.matrix[x+1][y] === 0 && this.matrix[x-1][y] === 0 && this.matrix[x][y+1] === 0 && this.matrix[x][y-1] === 0)
  }

  setStartPosition(playerId) {
    for (let x = 1; x < this.matrix.length; x++) {
      for (let y = 1; y < this.matrix[0].length; y++) {
        if (cellSafe(x, y)) {
          this.matrix[x][y] = playerId
          return [x, y]
        }
      }
    }
  }

}

module.exports = Game
