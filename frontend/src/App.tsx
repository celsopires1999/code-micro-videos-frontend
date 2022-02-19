import { Box, CssBaseline, MuiThemeProvider } from '@material-ui/core';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/Navibar';
import AppRouter from './routes/AppRouter';
import Breadcrumbs from './components/Breadcrumbs';
import theme from './theme';
import { SnackbarProvider } from './components/SnackbarProvider';
import Spinner from './components/Spinner';
import LoadingContext from './components/loading/LoadingContext';
import LoadingProvider from './components/loading/LoadingProvider';

const App: React.FC = () => {
  return (
    <React.Fragment>
      <LoadingProvider>
        <MuiThemeProvider theme={theme}>
          <SnackbarProvider>
            <CssBaseline>
              <BrowserRouter>
                <Spinner />
                <Navbar />
                <Box paddingTop={'70px'}>
                  <Breadcrumbs />
                  <AppRouter />
                </Box>
              </BrowserRouter>
            </CssBaseline>
          </SnackbarProvider>
        </MuiThemeProvider>
      </LoadingProvider>
    </React.Fragment>
  );
}

export default App;
