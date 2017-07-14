require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5555
const dal = require('./dal.js')

//list the Meds  using dal.listMeds(limit, cb function)
app.get('/', (req, res, next) =>
  res
    .status(200)
    .send('Welcome to the Pharma API!  Try a call to GET /meds for starters.')
)

app.get('/meds', function(req, res, next) {
  dal.listMeds(10, function(err, data) {
    if (err) console.log(err)
    res.status(200).send(data)
  })
})

app.listen(port, () => console.log('API up', port))
