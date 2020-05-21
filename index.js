require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

morgan.token('body', function (req) { return JSON.stringify(req.body) })
const customMorgan = morgan(':method :url :status :res[content-length] - :response-time ms :body')

app.use(express.json())
app.use(express.static('build'))
app.use(customMorgan)
app.use(cors())


app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

// Making use of mongoDB ID now
// const generateId = () => {
//   const newID = Math.round(Math.random() * 1000)
//   return newID
// }

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log(body)

  // using mongoDB validation to take over
  // if (!body.name || !body.number) {
  //   return response.status(400).json({
  //     error: 'the name or number is missing'
  //   })
  // }

  const person = new Person({
    name: body.name,
    number: body.number || '',
    date: new Date(),
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(
      `<p>Phonebook has info for ${persons.length} people </p>
      <br />
      <p>${new Date()}</p>`)
  })

})

// this id is based on MongoDB ID
app.get('/api/persons/:id', (request, response, next) => {
  const id = String(request.params.id)
  // const person = Person.find({_id: id}).then(person => {
  //   response.json(person)
  // })

  Person.findById(id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// this id is based on MongoDB ID
app.delete('/api/persons/:id', (request, response) => {
  const id = String(request.params.id)
  //persons = persons.filter(person => person.id !== id)
  Person.deleteOne({ _id: id }).then(
    response.status(204).end()
  )
})

// this id is based on MongoDB ID
app.put('/api/persons/:id', (request, response, next) => {
  const id = String(request.params.id)
  const toUpdate = request.body
  console.log('update', request.params.id)
  Person.findOneAndUpdate({ '_id': id }, {
    id: toUpdate.id,
    name: toUpdate.name,
    number: toUpdate.number,
    date: new Date()
  }, { runValidators: true, context: 'query', returnNewDocument: true })
    .then(
      savedPerson => {
        response.json(savedPerson)
      }
    )
    .catch(error => next(error))
})

const errorHandler = (error, request, response) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send(error)
  }

  // next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
