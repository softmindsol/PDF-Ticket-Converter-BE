// src/admin/components/my-login.jsx

import React from 'react';

// Import components from AdminJS's design system
// This ensures your login page has a consistent look and feel with the rest of the admin panel.
import {
  Box,
  H2,
  Label,
  Input,
  Button,
  MessageBox,
  Text,
} from '@adminjs/design-system';

/**
 * This is your custom login component.
 *
 * @param {object} props
 * @param {string} props.action - The URL to which the form should be submitted. AdminJS provides this.
 * @param {string} props.message - An error message to display if a previous login attempt failed.
 */
const MyLoginPage = ({ action, message }) => {
  return (
    // Main container that centers the login box on the page
    <Box
      flex
      flexGrow={1}
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bg="bg" // Use a background color from the AdminJS theme
    >
      {/* The form element itself */}
      <Box
        as="form"
        action={action}
        method="POST"
        bg="white"
        p="x5" // Padding
        width={['100%', '100%', '480px']} // Responsive width
        borderRadius="lg" // Rounded corners
        boxShadow="card" // A nice shadow effect
      >
        <H2 textAlign="center" mb="x3">
          Welcome Back
        </H2>
        <Text textAlign="center" mb="x3">
          Please sign in to continue
        </Text>

        {/* Display an error message if the `message` prop is present */}
        {message && (
          <MessageBox
            message={message.includes('authentication failed') ? 'Invalid username or password' : message}
            variant="danger"
            mb="x3"
          />
        )}

        {/* Username Input Field */}
        <Box mb="x3">
          <Label required htmlFor="username">Username</Label>
          <Input name="username" id="username" placeholder="Enter your username" />
        </Box>

        {/* Password Input Field */}
        <Box mb="x3">
          <Label required htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </Box>

        {/* Submit Button */}
        <Button type="submit" variant="primary" width="100%" size="lg">
          Sign In
        </Button>
      </Box>
    </Box>
  );
};

export default MyLoginPage;