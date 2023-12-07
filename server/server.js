const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const db = require('./config/connection');
const typeDefs = require('./Schemas/typeDefs');
const resolvers = require('./Schemas/resolvers');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Apply your authentication middleware to all GraphQL requests
app.use('/graphql', authMiddleware);

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Extract the token from the request headers
    const token = req.headers.authorization || '';
    // You can pass additional context data if needed
    return { token };
  },
});

// Apply Apollo Server as middleware to Express
server.applyMiddleware({ app, path: '/graphql' });

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}${server.graphqlPath}`));
});
