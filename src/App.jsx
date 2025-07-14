import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import URLShortenerPage from './components/URLShortenerPage';
import StatisticsPage from './components/StatisticsPage';
import RedirectHandler from './components/RedirectHandler';
import Navigation from './components/Navigation';
import FrontendLogger from './utils/logger';

const theme = createTheme({
  palette: {
    primary: { main: '#ff7b00' },
    secondary: { main: '#ff9100' },
  }
});

function App() {
  const logger = new FrontendLogger();

  useEffect(() => {
    logger.info('page', 'URL Shortener initialized');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #ff8c00 30%, #ffa500 90%)' }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>URL Shortener</Typography>
            </Toolbar>
          </AppBar>

          <Navigation />

          <Container component="main" maxWidth="xl" sx={{ mt: 2, mb: 2, flex: 1 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/shorten" replace />} />
              <Route path="/shorten" element={<URLShortenerPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/:shortCode" element={<RedirectHandler />} />
            </Routes>
          </Container>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;