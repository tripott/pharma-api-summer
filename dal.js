const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const db = new PouchDB(process.env.COUCHDB_URL + process.env.COUCHDB_NAME)
const buildPrimaryKey = require('./lib/build-primary-key')
const medPKGenerator = buildPrimaryKey('medication_')
const patientPKGenerator = buildPrimaryKey('patient_')
const { assoc, pathOr, head, last, split, filter, contains } = require('ramda')
const HTTPError = require('node-http-error')

const dal = {
  getMed,
  updateMed,
  getDoc,
  createDoc,
  deleteMed,
  createPatient,
  createMed,
  listMeds,
  listPatients,
  listPharmacies
}

/////////////////////////
//  MEDS
/////////////////////////

//CREATE a MED
function createMed(med, callback) {
  const pk = medPKGenerator(pathOr('', ['label'], med))
  med = assoc('_id', pk, med)
  med = assoc('type', 'medication', med)
  createDoc(med, callback)
}

//Update a med
function updateMed(med, callback) {
  med = assoc('type', 'medication', med)
  createDoc(med, callback)
}

function deleteMed(medId, callback) {
  deleteDoc(medId, callback)
}

function deleteDoc(id, callback) {
  db
    .get(id)
    .then(function(doc) {
      return db.remove(doc)
    })
    .then(function(result) {
      callback(null, result)
    })
    .catch(function(err) {
      callback(err)
    })
}

function createPatient(patient, callback) {
  const last = pathOr('', ['lastName'], patient)
  const first = pathOr('', ['firstName'], patient)
  const last4 = pathOr('', ['last4SSN'], patient)
  const patientNumber = pathOr('', ['patientNumber'], patient)

  const pk = patientPKGenerator(`${last} ${first} ${last4} ${patientNumber}`)
  patient = assoc('_id', pk, patient)
  patient = assoc('type', 'patient', patient)
  // or use a compose
  // patient = compose(
  //   assoc('_id', pk),
  //   assoc('type', 'patient')
  // )(patient)

  createDoc(patient, callback)
}

function getMed(medId, callback) {
  db.get(medId, function(err, doc) {
    if (err) return callback(err)

    doc.type === 'medication'
      ? callback(null, doc)
      : callback(new HTTPError(400, 'id is not a medication.'))
  })
}

function getDoc(id, callback) {
  db.get(id, function(err, doc) {
    if (err) return callback(err)
    callback(null, doc)
  })

  // db.get(id).then(function(doc) {
  //   return callback(null, doc)
  // }).catch(function(err) {
  //   return callback(err)
  // })
}

function createDoc(doc, callback) {
  console.log('createDoc', doc)

  db.put(doc).then(res => callback(null, res)).catch(err => callback(err))
}

function listMeds(lastItem, medFilter, limit, callback) {
  var query = {}
  if (medFilter) {
    const arrFilter = split(':', medFilter)
    //arrFilter = ['form', 'syrup']
    const filterField = head(arrFilter)
    // filterField = 'form'
    const filterValue = last(arrFilter)
    // filterField = 'syrup'
    const selectorValue = assoc(filterField, filterValue, {})

    //selectorValue = {form: 'syrup'}
    query = { selector: selectorValue, limit }
  } else if (lastItem) {
    query = { selector: { _id: { $gt: lastItem }, type: 'medication' }, limit }
  } else {
    // 1st page of results
    //  /meds?limit=5
    query = { selector: { _id: { $gte: null }, type: 'medication' }, limit }
  }

  find(query, function(err, data) {
    if (err) return callback(err)
    callback(null, data.docs)
  })
}

function listPatients(limit, callback) {
  find(
    {
      selector: {
        type: 'patient'
      }
    },
    function(err, data) {
      if (err) return callback(err)
      callback(null, data.docs)
    }
  )
}

function listPharmacies(filter, lastItem, limit, callback) {
  var query = {}
  if (filter) {
    const arrFilter = split(':', filter)
    const filterField = head(arrFilter)
    const filterValue = last(arrFilter)

    const selectorValue = assoc(filterField, filterValue, {})
    // selectorValue = {storeNumber: 1004}
    query = {
      selector: selectorValue,
      limit
    }
  } else if (lastItem) {
    // we need to grab the next page of documents
    query = {
      selector: {
        _id: { $gt: lastItem },
        type: 'pharmacy'
      },
      limit
    }
  } else {
    query = {
      selector: {
        _id: { $gte: null },
        type: 'pharmacy'
      },
      limit
    }
  }

  find(query, function(err, data) {
    if (err) return callback(err)
    callback(null, data.docs)
  })
}

function find(query, cb) {
  console.log('query', JSON.stringify(query, null, 2))
  query ? db.find(query, cb) : cb(null, [])
}

module.exports = dal
