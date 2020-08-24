import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';
const query = require('./query')
const invoke = require('./invoke')

const PORT = process.env.PORT || 3000

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((err, req, res, next) => {
    res.locals.error = err;
    if (err.status >= 100 && err.status < 600) {
        res.status(err.status);
    } else {
        res.status(500);
        res.json({
          error: err
        })
    }
});

const fabcar_typeDefs = `
    type Car {
        make: String
        model: String
        colour: String
        owner: String
    }

    type Query {
        QueryCar(name: String): Car
        QueryAllCars: [Car]
    }

    type Mutation {
        CreateCar(name: String, make: String, model: String, colour: String, owner: String): String
    }
`

const fabcar_resolvers = {
    Query: {
        QueryCar: (_, { name }) => {
            return new Promise(async (resolve, reject) => {
                var result = await query(['queryCar', name])
                console.log(JSON.parse(result))
                resolve(JSON.parse(result))
            })
        },
        QueryAllCars: () => {
            return new Promise(async (resolve, reject) => {
                var result = await query(['queryAllCars'])
                var parsedResult = JSON.parse(result)
                var response = []
                parsedResult.forEach(data => {
                    response.push(data.Record)
                })
                console.log(response)
                resolve(response)
            })
        }
    },
    Mutation: {
        CreateCar: (_, { name, make, model, colour, owner }) => {
            return new Promise(async (resolve, reject) => {
                var result = await invoke(['createCar', name, make, model, colour, owner])
                // console.log(JSON.parse(result))
                resolve(`CAR ${name} added`)
            })
        }
    }
}

const schema = makeExecutableSchema({
    typeDefs: [
        fabcar_typeDefs
    ],
    resolvers: [
        fabcar_resolvers
    ]
});

app.get('/', (_, res) => {
    res.redirect('/graphql');
}).use('/graphql', graphqlHTTP(() => ({
    schema: schema,
    graphiql: true,
})));

app.listen(PORT, () => console.log(`Running server on port http://localhost:${PORT}`));
