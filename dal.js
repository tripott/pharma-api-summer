const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const db = new PouchDB(process.env.COUCHDB_URL + process.env.COUCHDB_NAME)
const buildPrimaryKey = require('./lib/build-primary-key')
const medPKGenerator = buildPrimaryKey('medication_')
const patientPKGenerator = buildPrimaryKey('patient_')
const { assoc, pathOr } = require('ramda')
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

function listMeds(limit, callback) {
  find(
    {
      selector: {
        type: 'medication'
      }
    },
    function(err, data) {
      if (err) return callback(err)
      callback(null, data.docs)
    }
  )
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

function listPharmacies(limit, callback) {
  find(
    {
      selector: {
        type: 'pharmacy'
      }
    },
    function(err, data) {
      if (err) return callback(err)
      callback(null, data.docs)
    }
  )
}

function find(query, cb) {
  console.log('query', JSON.stringify(query, null, 2))
  query ? db.find(query, cb) : cb(null, [])
}

module.exports = dal
