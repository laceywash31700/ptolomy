// theme.js
import { extendTheme } from '@mui/joy/styles';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

// Joy UI theme
const joyTheme = extendTheme({
  // Add your Joy UI theme configuration here
  colorSchemes: {
    light: {
      palette: {
        primary: {
          // Define your primary color here
          main: '#007bff',
        },
      },
    },
  },
});

// Material UI theme
const materialTheme = createTheme({
  // Add your Material UI theme configuration here
  palette: {
    primary: {
      // Define your primary color here
      main: '#007bff',
    },
  },
});

const ThemeProvider = ({ children }) => {
  return (
    <MuiThemeProvider theme={materialTheme}>
      <ThemeProvider theme={joyTheme}>{children}</ThemeProvider>
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
