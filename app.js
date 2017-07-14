require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5555
const dal = require('./dal.js')
const { pathOr } = require('ramda')
const buildPrimaryKey = require('./lib/build-primary-key')

//list the Meds  using dal.listMeds(limit, cb function)
app.get('/', (req, res, next) =>
  res
    .status(200)
    .send('Welcome to the Pharma API!  Try a call to GET /meds for starters.')
)

app.post('/meds', function(req, res, next) {
  const med = pathOr(null, ['body'], req)

  // MONDAY TO DO
  // build a primary key generator function to create pk value: buildPrimaryKey(prefix, data)
  // assoc (add) a primary key value (_id) to the med object
  // assoc (add) a type property = "medication" to the med object

  dal.createDoc(med, function(err, result) {
    if (err) console.log(err)
    res.status(201).send(result)
  })
})

app.get('/meds', function(req, res, next) {
  dal.listMeds(10, function(err, data) {
    if (err) console.log(err)
    res.status(200).send(data)
  })
})

app.get('/patients', function(req, res, next) {
  dal.listPatients(10, function(err, data) {
    if (err) console.log(err)
    res.status(200).send(data)
  })
})

app.get('/pharmacies', function(req, res, next) {
  dal.listPharmacies(10, function(err, data) {
    if (err) console.log(err)
    res.status(200).send(data)
  })
})

app.listen(port, () => console.log('API up', port))
