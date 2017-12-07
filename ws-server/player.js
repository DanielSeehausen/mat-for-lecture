class Player {
  constructor(game, ws, ip, playerData) {
    this.ws = ws
    this.ip = ip
    this.id = playerData.id
    this.color = playerData.color
    this.position = game.setStartPosition()
  }

}

module.exports = Player
