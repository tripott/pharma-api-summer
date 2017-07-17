require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5555
const dal = require('./dal.js')
const { pathOr } = require('ramda')
const bodyParser = require('body-parser')
const HTTPError = require('node-http-error')

app.use(bodyParser.json())

//list the Meds  using dal.listMeds(limit, cb function)
app.get('/', (req, res, next) =>
  res
    .status(200)
    .send('Welcome to the Pharma API!  Try a call to GET /meds for starters.')
)

app.post('/meds', function(req, res, next) {
  const med = pathOr(null, ['body'], req)
  console.log('req.body', med)

  dal.createMed(med, function(err, result) {
    //TODO:  Return a real error and set up error handling middleware
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(201).send(result)
  })
})

app.get('/meds', function(req, res, next) {
  dal.listMeds(10, function(err, data) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(200).send(data)
  })
})

app.get('/patients', function(req, res, next) {
  dal.listPatients(10, function(err, data) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(200).send(data)
  })
})

app.get('/pharmacies', function(req, res, next) {
  dal.listPharmacies(10, function(err, data) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(200).send(data)
  })
})

// ERROR HANDLING MIDDLEWARE SHOULD RESIDE JUST ABOVE THE LISTEN
app.use(function(err, req, res, next) {
  console.log(req.method, req.path, err)
  res.status(err.status || 500)
  res.send(err)
})

app.listen(port, () => console.log('API up', port))
