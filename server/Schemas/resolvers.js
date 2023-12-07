const { User, Book } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
};

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('books');
      }
      throw AuthenticationError;
    },
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      const token = generateToken(user);
      return { token, user };
    },

    addUser: async (_, { username, email, password }) => {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ username, email, password: hashedPassword });
      const token = generateToken(newUser);
      return { token, user: newUser };
    },

    saveBook: async (_, { input }, { user }) => {
      if (user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: input } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },

    removeBook: async (_, { bookId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      const currentUser = await User.findById(user._id);
      if (!currentUser) {
        throw new Error('User not found');
      }

      const removedBook = await Book.findByIdAndRemove(bookId);
      if (!removedBook) {
        throw new Error('Book not found');
      }

      currentUser.books.pull(bookId);
      await currentUser.save();

      return removedBook;
    },
  },
};

module.exports = resolvers;
