import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders App component', () => {
  const mockSetIsDarkMode = jest.fn();
  render(<App isDarkMode={false} setIsDarkMode={mockSetIsDarkMode} />);
  const linkElement = screen.getByText(/Database Manager/i); // Adjust based on your App content
  expect(linkElement).toBeInTheDocument();
});