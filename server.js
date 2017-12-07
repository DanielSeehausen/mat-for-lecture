const express = require('express')
const path = require('path')
const app = express()
require('./ws-server/ws-server.js')

const root = __dirname + '/public/' // yoo no it

// some middleware for logging the knotty bad asset requests
app.use((req, res, next) => {
  console.log(req.connection.remoteAddress + " requesting: " + req.originalUrl)
  next()
})

// root bebeeh
app.get('/', (req, res) => {
  res.sendFile(root + 'index.html')
})

app.get('/style/:file', (req, res) => {
  res.sendFile(root + '/style/' + req.params.file)
})

app.get('/scripts/:file', (req, res) => {
  res.sendFile(root + '/scripts/' + req.params.file)
})

// routes for all the 404 pages assets, including stylesheet
app.get('/404/:file', (req, res) => {
  res.sendFile(root + '/404/' + req.params.file)
})

// catch all sends them suckas two bernard u no it m8
app.get('*', (req, res) => {
  console.log('fell through');
  res.sendFile(root + '/404/index.html')
})


app.listen(3000)
