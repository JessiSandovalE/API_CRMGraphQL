const { ApolloServer } = require('apollo-server');
const resolvers = require('./db/resolvers');
const typeDefs = require('./db/schema')

const conectarDB = require('./config/db')

conectarDB();

//Servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context : () => {
    const miContext = "Hola";
    return {
      miContext
    }
  }
});
//Arrancar el servidor
server.listen().then(({url})=> {
  console.log(`Servidor listo en la url ${url}`)
})