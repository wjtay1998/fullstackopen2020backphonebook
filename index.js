const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
const customMorgan = morgan(':method :url :status :res[content-length] - :response-time ms :body')

app.use(express.json())
app.use(express.static('build'))
app.use(customMorgan)
app.use(cors())

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id : 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id : 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
]



app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

const generateId = () => {
  const newID = Math.round(Math.random() * 1000)  
  return newID
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log(body)

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'the name or number is missing' 
    })
  }else if(persons.find(person => person.name == body.name) != null){
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = {
    name: body.name,
    number: body.number || '',
    date: new Date(),
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})

app.get('/info', (request, response) => {
  response.send(
      `<p>Phonebook has info for ${persons.length} people </p>
      <br />
      <p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.put('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  const update = request.body
  if(person) {
    console.log('put entered', update)
    persons = persons.map(person => person.id === id ? update : person)
    response.json(person)
  } else {
    console.log('put failed')
    response.status(404).end()
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
