import { useState, useEffect } from 'react';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row
} from 'react-bootstrap';
import Auth from '../utils/auth';
import { useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../utils/mutations'; // Import the SAVE_BOOK mutation

const SearchBooks = () => {
  // ... (other existing state and logic)

  // Mutation hook for saveBook
  const [saveBookMutation] = useMutation(SAVE_BOOK);

  

  // create function to handle saving a book to our database using Apollo mutation
  const handleSaveBook = async (bookId) => {
    // find the book in `searchedBooks` state by the matching id
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await saveBookMutation({
        variables: { input: { ...bookToSave } }
      });

      if (data && data.saveBook) {
        // if book successfully saves to user's account, save book id to state
        setSavedBookIds([...savedBookIds, bookToSave.bookId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ... (existing JSX)
};

export default SearchBooks;
