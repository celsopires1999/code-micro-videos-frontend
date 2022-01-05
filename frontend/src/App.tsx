import { Box, CssBaseline, MuiThemeProvider } from '@material-ui/core';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/Navibar';
import AppRouter from './routes/AppRouter';
import Breadcrumbs from './components/Breadcrumbs';
import theme from './theme';
import { SnackbarProvider } from './components/SnackbarProvider';

const App: React.FC = () => {
  return (
    <React.Fragment>
      <MuiThemeProvider theme={theme}>
        <SnackbarProvider>
            <CssBaseline>
              <BrowserRouter>
                <Navbar/>
                <Box paddingTop={ '70px' }>
                  <Breadcrumbs />
                  <AppRouter />
                </Box>
              </BrowserRouter>
            </CssBaseline>
        </SnackbarProvider>
        </MuiThemeProvider>
    </React.Fragment>  
  );
}

export default App;
