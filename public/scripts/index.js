// CONFIG***********************************************************************
const COLCOUNT = 10
const ROWCOUNT = 10
const WSSERVER = 'ws://192.168.4.70:8080'
var PLAYERVAL = 'U'
var PLAYERCOLOR = null
var CURRPOS = null
var VALMAT = [
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

// TITLE-INIT*******************************************************************
function fadeIn(el) {
  el.classList.add("bounce")
  console.log('wot');
}

function delayedFadeIn(div, range, min=0) {
  setTimeout(() => {
    fadeIn(div)
  }, Math.random() * range + min)
}

function fadeLettersIn() {
  Array.from(document.getElementsByClassName("title-letter")).forEach(div => {
    delayedFadeIn(div, 800)
  })
}

fadeLettersIn()


// INIT*************************************************************************
function genMatrixHTML() {
  let matrixHTML = []
  for (let rowIdx = 0; rowIdx < ROWCOUNT; rowIdx++) {
    matrixHTML.push(`<ul class="row">`)
      for (let colIdx = 0; colIdx < COLCOUNT; colIdx++) {
        matrixHTML.push(`<li class="cell">0</li>`)
      }
    matrixHTML.push(`</ul>`)
  }
  return matrixHTML.join('')
}

function appendMatrix(matrix) {
  document.getElementById("matrix").innerHTML = matrix
}

function getMatrixRefs() {
  const domArr = Array.from(document.getElementsByClassName("row"))
  return domArr.map(row => (Array.from(row.childNodes)))
}

const matrixHTML = genMatrixHTML()
appendMatrix(matrixHTML)
const DOMMATRIX = getMatrixRefs()
// MATFUNCS*********************************************************************

function mapValsToDom(valMat, domMat) {
  for (let rIdx = 0; rIdx < ROWCOUNT; rIdx++) {
    for (let cIdx = 0; cIdx < COLCOUNT; cIdx++)
      domMat[rIdx][cIdx].innerHTML = valMat[rIdx][cIdx]
  }
}

function outOfBounds(newLoc) {
  return (newLoc[0] < 0 || newLoc[0] >= ROWCOUNT ||
    newLoc[1] < 0 || newLoc[1] >= COLCOUNT)
}

function isValidMove(valMat, currPos, jaunt) {
  console.log(CURRPOS, jaunt);
  const newLoc = [currPos[0] + jaunt[0], currPos[1] + jaunt[1]]
  return (!outOfBounds(newLoc) && valMat[newLoc[0]][newLoc[1]] === 0)
}

const DIRECTIONS = [[0, -1], [1, 0], [0, 1], [-1, 0]]
function getAvailableDirections(valMat, currPos) {
  return DIRECTIONS.filter(jaunt => isValidMove(valMat, currPos, jaunt))
}

function move(oldPos, jaunt) {
  return [oldPos[0] + jaunt[0], oldPos[1] + jaunt[1]]
}

mapValsToDom(VALMAT, DOMMATRIX)

// WS***************************************************************************
const GREETING = "Client websocket opened"
const FAREWELL = "Client websocket closed"
const ERROR = "Client websocket errored"

const ws = new WebSocket(WSSERVER)

// Connection opened
ws.addEventListener('open', (event) => {
  console.log(GREETING, event.data)
})

// Listen for messages
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data)
  console.log(msg)
  if (msg.action === 'init') {
    CURRPOS = msg.data.pos
    PLAYERVAL = msg.data.val
    PLAYERCOLOR = msg.data.color
    DOMMATRIX[CURRPOS[0]][CURRPOS[1]].innerHTML = PLAYERVAL
    DOMMATRIX[CURRPOS[0]][CURRPOS[1]].style.backgroundColor = PLAYERCOLOR
  }
  if (msg.action === 'playerPos') {
    CURRPOS = msg.data
    DOMMATRIX[CURRPOS[0]][CURRPOS[1]].style.backgroundColor = PLAYERCOLOR
  }
  if (msg.action === 'matrix') {
    VALMAT = msg.data
    mapValsToDom(VALMAT, DOMMATRIX)
  }
})

// Connection closed
ws.addEventListener('close', (event) => {
  console.log(FAREWELL, event.data)
})

// Connection errored
ws.addEventListener('error', (event) => {
  console.error(ERROR, event.data)
})

// GAME EVENT LISTENER AND ACTION DISPATCH**************************************
window.onkeyup = (e) => {
  switch (true) {
    case (true === (e.keyCode === 87 || e.keyCode === 38) && isValidMove(VALMAT, CURRPOS, [-1, 0])):
      ws.send(JSON.stringify({action: 'move', data: move(CURRPOS, [-1, 0])}))
      return
    case (true === (e.keyCode === 68 || e.keyCode === 39) && isValidMove(VALMAT, CURRPOS, [0, 1])):
      ws.send(JSON.stringify({action: 'move', data: move(CURRPOS, [0, 1])}))
      return
    case (true === (e.keyCode === 83 || e.keyCode === 40) && isValidMove(VALMAT, CURRPOS, [1, 0])):
      ws.send(JSON.stringify({action: 'move', data: move(CURRPOS, [1, 0])}))
      return
    case (true === (e.keyCode === 37 || e.keyCode === 65) && isValidMove(VALMAT, CURRPOS, [0, -1])):
      ws.send(JSON.stringify({action: 'move', data: move(CURRPOS, [0, -1])}))
      return
    default:
      console.log("INVALID MOVE YOU JABRONI!");
  }
}
