require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5555
const dal = require('./dal.js')
const { pathOr, keys } = require('ramda')
const bodyParser = require('body-parser')
const HTTPError = require('node-http-error')
const checkRequiredFields = require('./lib/check-required-fields')
const checkMedReqFields = checkRequiredFields([
  'label',
  'ingredients',
  'amount',
  'unit',
  'form'
])
const checkPatientReqFields = checkRequiredFields([
  'firstName',
  'lastName',
  'patientNumber',
  'last4SSN'
])
const checkPharmReqFields = checkRequiredFields([
  'storeNumber',
  'storeChainName',
  'storeName'
])

app.use(bodyParser.json())

/////////////////////////
///  WELCOME
////////////////////////
app.get('/', (req, res, next) =>
  res
    .status(200)
    .send('Welcome to the Pharma API!  Try a call to GET /meds for starters.')
)

// CREATE
app.post('/meds', function(req, res, next) {
  const med = pathOr(null, ['body'], req)

  const checkResults = checkMedReqFields(med)

  if (checkResults.length > 0) {
    return next(
      new HTTPError(400, 'Missing required fields in the request body.', {
        fields: checkResults,
        foo: true
      })
    )
  }

  dal.createMed(med, function(err, result) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(201).send(result)
  })
})

// READ A MED
app.get('/meds/:id', function(req, res, next) {
  console.log('req:', req)
  const medId = pathOr(null, ['params', 'id'], req)

  if (medId) {
    // get the data
    dal.getMed(medId, function(err, doc) {
      if (err) return next(new HTTPError(err.status, err.message, err))

      //TODO: make sure the returned doc is medication. if not send error
      res.status(200).send(doc)
    })
    // return the data to the client
  } else {
    return next(new HTTPError(400, 'Missing medication id in path.'))
  }
})

// UPDATE a MED
app.put('/meds/:id', function(req, res, next) {
  const medId = pathOr(null, ['params', 'id'], req)
  const body = pathOr(null, ['body'], req)
  console.log('body', body)
  if (!body || keys(body).length === 0)
    return next(new HTTPError(400, 'Missing medication in request body.'))

  dal.updateMed(body, function(err, response) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(200).send(response)
  })
})

// DELETE A MED
app.delete('/meds/:id', function(req, res, next) {
  const medId = pathOr(null, ['params', 'id'], req)

  dal.deleteMed(medId, function(err, response) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(200).send(response)
  })
})

// LIST ALL THE MEDS
app.get('/meds', function(req, res, next) {
  // /meds?filter=form:syrup&limit=5

  const filter = pathOr(null, ['query', 'filter'], req)
  const limit = pathOr(50, ['query', 'limit'], req)
  const lastItem = pathOr(null ,['query', 'lastItem'], req)

  dal.listMeds(lastItem, filter, Number(limit), function(err, data) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(200).send(data)
  })
})

////////////////////////////
///   PATIENTS
////////////////////////////
app.post('/patients', function(req, res, next) {
  const patient = pathOr(null, ['body'], req)
  console.log('patient body:', patient)

  patient
    ? dal.createPatient(patient, function(err, result) {
        if (err) return next(new HTTPError(err.status, err.message, err))
        res.status(201).send(result)
      })
    : next(new HTTPError(400, 'Missing patient in request.'))
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
