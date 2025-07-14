import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import URLService from '../services/urlService';
import FrontendLogger from '../utils/logger';

function RedirectHandler() {
    const { shortCode } = useParams();
    const [state, setState] = useState({ loading: true, error: null, urlData: null });
    const logger = new FrontendLogger();

    useEffect(() => {
        if (!shortCode) return;

        let timer;
        const handleRedirection = async () => {
            try {
                await logger.info('component', `Redirect: ${shortCode}`);
                const data = await URLService.getUrlByShortCode(shortCode);

                if (!data) {
                    setState({ loading: false, error: 'URL not found or expired', urlData: null });
                    await logger.warn('component', `Not found: ${shortCode}`);
                    return;
                }

                setState({ loading: false, error: null, urlData: data });
                await URLService.recordClick(shortCode, 'direct-access', 'localhost');

                timer = setTimeout(() => {
                    window.location.href = data.originalUrl;
                }, 2000);

                await logger.info('component', `Redirecting to: ${data.originalUrl}`);
            } catch (error) {
                setState({ loading: false, error: 'Redirect processing error', urlData: null });
                await logger.error('component', `Error: ${error.message}`);
            }
        };

        handleRedirection();
        return () => clearTimeout(timer);
    }, [shortCode]);

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            px: 2,
            maxWidth: '800px',
            mx: 'auto',
            background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
            borderRadius: 2,
            mt: 2
        }
    };

    if (state.loading) {
        return (
            <Box sx={styles.container}>
                <CircularProgress sx={{ mb: 3, color: '#ff6f00' }} />
                <Typography variant="h5" sx={{ color: '#e65100', fontWeight: 600, textAlign: 'center' }}>
                    Processing redirect...
                </Typography>
            </Box>
        );
    }

    if (state.error) {
        return (
            <Box sx={styles.container}>
                <Alert severity="error" sx={{ mb: 3, width: '90%' }}>
                    {state.error}
                </Alert>
                <Typography variant="h6" sx={{ color: '#e65100', textAlign: 'center' }}>
                    The shortened URL doesn't exist or has expired.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={styles.container}>
            <Typography variant="h4" gutterBottom sx={{ color: '#e65100', fontWeight: 700, mb: 3, textAlign: 'center' }}>
                Redirecting...
            </Typography>

            <Box sx={{
                bgcolor: 'rgba(255, 111, 0, 0.1)',
                borderRadius: 2,
                p: 3,
                border: '2px solid #ffb74d',
                width: '90%'
            }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: '#bf360c' }}>
                    You will be redirected to:
                </Typography>

                <Typography variant="body1" sx={{
                    mb: 3,
                    textAlign: 'center',
                    fontWeight: 600,
                    color: '#ff6f00',
                    wordBreak: 'break-all',
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid #ffcc02'
                }}>
                    {state.urlData?.originalUrl}
                </Typography>

                <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: '#e65100' }}>
                    If not redirected automatically, click below.
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={() => window.location.href = state.urlData.originalUrl}
                        sx={{
                            background: 'linear-gradient(45deg, #ff6f00 30%, #ff8f00 90%)',
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            boxShadow: '0 3px 15px rgba(255, 111, 0, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #e65100 30%, #ff6f00 90%)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        Go to Destination
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default RedirectHandler;