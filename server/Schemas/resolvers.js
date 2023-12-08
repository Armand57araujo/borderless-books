const { User, Book } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const user = await User.findOne({ _id: context.user._id }).select('-__v -password')
        console.log(user);
        return user;
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

      const token = signToken(user);
      return { token, user };
    },

    addUser: async (_, { username, email, password }) => {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ username, email, password });
      const token = signToken(newUser);
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
      throw AuthenticationError;
    },

    removeBook: async (_, { bookId }, { user }) => {
      if (!user) {
        throw AuthenticationError;
      } 

      const currentUser = await User.findByIdAndUpdate(user._id, 
        { $pull: { savedBooks: { bookId } } }, { new: true });
      if (!currentUser) {
        throw new Error('User not found');
      } return currentUser;
    },
  },
};

module.exports = resolvers;
