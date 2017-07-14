const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const db = new PouchDB(process.env.COUCHDB_URL + process.env.COUCHDB_NAME)

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

const dal = {
  createDoc,
  listMeds,
  listPatients,
  listPharmacies
}

module.exports = dal
