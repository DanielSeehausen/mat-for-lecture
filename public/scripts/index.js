// CONFIG***********************************************************************
const WSSERVER = 'ws://localhost:8080'

// WSCONFIG*********************************************************************
var COLCOUNT = null
var ROWCOUNT = null
var PLAYERID = null
var PLAYERCOLOR = null
var CURRPOS = null
var VALMAT = null
var DOMMAT = null
var PLAYERCOLORS = null

// TITLE-INIT*******************************************************************
function titleInit() {
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
      delayedFadeIn(div, 10000)
    })
  }
  fadeLettersIn()
}
titleInit()

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

// MATFUNCS*********************************************************************
function mapValsToDom(valMat, domMat) {
  for (let rIdx = 0; rIdx < ROWCOUNT; rIdx++) {
    for (let cIdx = 0; cIdx < COLCOUNT; cIdx++) {
      domMat[rIdx][cIdx].innerHTML = valMat[rIdx][cIdx]
      if (valMat[rIdx][cIdx] === PLAYERID)
        domMat[rIdx][cIdx].style.backgroundColor = PLAYERCOLOR
    }
  }
}

function outOfBounds(newLoc) {
  return (newLoc[0] < 0 || newLoc[0] >= ROWCOUNT ||
    newLoc[1] < 0 || newLoc[1] >= COLCOUNT)
}

function isValidMove(valMat, currPos, jaunt) {
  const newLoc = [currPos[0] + jaunt[0], currPos[1] + jaunt[1]]
  return (!outOfBounds(newLoc) && (valMat[newLoc[0]][newLoc[1]] === 0 || valMat[newLoc[0]][newLoc[1]] === 3))
}

function getAvailableDirections(valMat, currPos) {
  return [[-1, 0], [0, 1], [1, 0], [0, -1]].filter(jaunt => isValidMove(valMat, currPos, jaunt))
}

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
    CURRPOS = msg.data.startPos
    PLAYERID = msg.data.id
    PLAYERCOLOR = msg.data.color
    VALMAT = msg.data.mat
    COLCOUNT = msg.data.rowCount
    ROWCOUNT = msg.data.colCount
    PLAYERCOLORS = msg.data.playerColors
    appendMatrix(genMatrixHTML(ROWCOUNT, COLCOUNT))
    DOMMAT = getMatrixRefs()
    mapValsToDom(VALMAT, DOMMAT)
  }

  if (msg.action === 'playerPos') {
    CURRPOS = msg.data
    DOMMAT[CURRPOS[0]][CURRPOS[1]].style.backgroundColor = PLAYERCOLOR
  }

  if (msg.action === 'matrix') {
    VALMAT = msg.data
    mapValsToDom(VALMAT, DOMMAT)
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
      ws.send(JSON.stringify({action: 'move', direction: [-1, 0]}))
      return
    case (true === (e.keyCode === 68 || e.keyCode === 39) && isValidMove(VALMAT, CURRPOS, [0, 1])):
      ws.send(JSON.stringify({action: 'move', direction: [0, 1]}))
      return
    case (true === (e.keyCode === 83 || e.keyCode === 40) && isValidMove(VALMAT, CURRPOS, [1, 0])):
      ws.send(JSON.stringify({action: 'move', direction: [1, 0]}))
      return
    case (true === (e.keyCode === 37 || e.keyCode === 65) && isValidMove(VALMAT, CURRPOS, [0, -1])):
      ws.send(JSON.stringify({action: 'move', direction: [0, -1]}))
      return
    default:
      console.log("INVALID MOVE YOU JABRONI!");
  }
}
