import { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, TextField, Button, Typography, Grid, Alert, Chip,
    IconButton, Tooltip, useMediaQuery, useTheme
} from '@mui/material';
import { Add, Remove, ContentCopy } from '@mui/icons-material';
import URLService from '../services/urlService';
import FrontendLogger from '../utils/logger';

function URLShortenerPage() {
    const [urlInputs, setUrlInputs] = useState([{ originalUrl: '', customShortCode: '', validityMinutes: 30 }]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const logger = new FrontendLogger();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const orangeColor = '#ff7b00';
    const orangeLight = 'rgba(255, 123, 0, 0.05)';

    useEffect(() => { logger.info('page', 'URL Shortener page loaded'); }, []);

    const addUrlInput = () => {
        if (urlInputs.length < 5) {
            setUrlInputs([...urlInputs, { originalUrl: '', customShortCode: '', validityMinutes: 30 }]);
            logger.info('component', 'Added URL input');
        }
    };

    const removeUrlInput = (index) => {
        if (urlInputs.length > 1) {
            setUrlInputs(urlInputs.filter((_, i) => i !== index));
            logger.info('component', `Removed URL input #${index}`);
        }
    };

    const updateUrlInput = (index, field, value) => {
        const newInputs = [...urlInputs];
        newInputs[index][field] = value;
        setUrlInputs(newInputs);

        if (errors[`${index}-${field}`]) {
            const newErrors = { ...errors };
            delete newErrors[`${index}-${field}`];
            setErrors(newErrors);
        }
    };

    const validateInputs = async () => {
        const newErrors = {};
        let isValid = true;

        urlInputs.forEach((input, index) => {
            // URL validation
            if (!input.originalUrl.trim()) {
                newErrors[`${index}-originalUrl`] = 'Required';
                isValid = false;
            } else {
                try { new URL(input.originalUrl); }
                catch {
                    newErrors[`${index}-originalUrl`] = 'Invalid URL';
                    isValid = false;
                }
            }

            if (input.validityMinutes <= 0 || !Number.isInteger(Number(input.validityMinutes))) {
                newErrors[`${index}-validityMinutes`] = 'Positive integer required';
                isValid = false;
            }

            if (input.customShortCode && !/^[a-zA-Z0-9]{1,10}$/.test(input.customShortCode)) {
                newErrors[`${index}-customShortCode`] = 'Alphanumeric (max 10 chars)';
                isValid = false;
            }
        });

        setErrors(newErrors);
        if (!isValid) await logger.warn('component', 'Validation failed');
        return isValid;
    };

    const handleSubmit = async () => {
        await logger.info('component', 'URL shortening started');
        if (!(await validateInputs())) return;

        setLoading(true);
        setResults([]);

        try {
            const results = [];

            for (const input of urlInputs.filter(i => i.originalUrl.trim())) {
                try {
                    const result = await URLService.createShortUrl(
                        input.originalUrl,
                        input.customShortCode,
                        parseInt(input.validityMinutes)
                    );
                    results.push({ success: true, data: result, originalInput: input });
                } catch (error) {
                    results.push({ success: false, error: error.message, originalInput: input });
                    await logger.error('component', `Failed: ${error.message}`);
                }
            }

            setResults(results);
            await logger.info('component', `${results.filter(r => r.success).length} URLs shortened`);
        } catch (error) {
            await logger.error('component', `Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ px: { xs: 1, md: 2 } }}>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom align="center"
                sx={{ color: orangeColor, fontWeight: 'bold', my: 2 }}>
                URL Shortener
            </Typography>

            <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 1 }}>
                <CardContent sx={{ bgcolor: orangeLight, borderTop: `3px solid ${orangeColor}` }}>
                    <Typography variant="h6" sx={{ color: orangeColor, mb: 2 }}>
                        Create Short URLs (Up to 5)
                    </Typography>

                    {urlInputs.map((input, index) => (
                        <Box key={index} sx={{ mb: 2, p: 1.5, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fff' }}>
                            <Grid container spacing={1} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <TextField fullWidth label="Original URL" value={input.originalUrl} size={isMobile ? "small" : "medium"}
                                        onChange={(e) => updateUrlInput(index, 'originalUrl', e.target.value)}
                                        error={!!errors[`${index}-originalUrl`]} helperText={errors[`${index}-originalUrl`]}
                                        placeholder="https://example.com" margin="dense" sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: orangeColor } } }} />
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField fullWidth label="Custom Shortcode" value={input.customShortCode} size={isMobile ? "small" : "medium"}
                                        onChange={(e) => updateUrlInput(index, 'customShortCode', e.target.value)}
                                        error={!!errors[`${index}-customShortCode`]} helperText={errors[`${index}-customShortCode`]}
                                        placeholder="abc123" margin="dense" sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: orangeColor } } }} />
                                </Grid>

                                <Grid item xs={6} sm={3} md={2}>
                                    <TextField fullWidth label="Validity (min)" type="number" value={input.validityMinutes} size={isMobile ? "small" : "medium"}
                                        onChange={(e) => updateUrlInput(index, 'validityMinutes', e.target.value)}
                                        error={!!errors[`${index}-validityMinutes`]} helperText={errors[`${index}-validityMinutes`]}
                                        margin="dense" sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: orangeColor } } }} />
                                </Grid>

                                <Grid item xs={6} sm={3} md={3}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {index === urlInputs.length - 1 && urlInputs.length < 5 && (
                                            <Tooltip title="Add URL">
                                                <IconButton onClick={addUrlInput} sx={{ color: orangeColor }} size={isMobile ? "small" : "medium"}>
                                                    <Add />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {urlInputs.length > 1 && (
                                            <Tooltip title="Remove URL">
                                                <IconButton onClick={() => removeUrlInput(index)} color="error" size={isMobile ? "small" : "medium"}>
                                                    <Remove />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    ))}

                    <Button variant="contained" onClick={handleSubmit} disabled={loading} fullWidth
                        sx={{ mt: 2, py: 1, bgcolor: orangeColor, '&:hover': { bgcolor: '#e56e00' } }}>
                        {loading ? 'Creating...' : 'Create Short URLs'}
                    </Button>
                </CardContent>
            </Card>

            {results.length > 0 && (
                <Card sx={{ boxShadow: 2, borderRadius: 1, mb: 3 }}>
                    <CardContent sx={{ bgcolor: orangeLight, borderTop: `3px solid ${orangeColor}` }}>
                        <Typography variant="h6" gutterBottom sx={{ color: orangeColor }}>Results</Typography>

                        <Grid container spacing={2}>
                            {results.map((result, index) => (
                                <Grid item xs={12} md={6} key={index}>
                                    <Box sx={{ p: 1.5, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fff', height: '100%' }}>
                                        {result.success ? (
                                            <>
                                                <Typography noWrap color="text.secondary" variant="subtitle2">
                                                    Original: {result.originalInput.originalUrl}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                    <Typography sx={{ fontWeight: 'bold', mr: 1, color: orangeColor }}>
                                                        {result.data.shortUrl}
                                                    </Typography>
                                                    <IconButton size="small" onClick={async () => await navigator.clipboard.writeText(result.data.shortUrl)}
                                                        sx={{ color: orangeColor }}>
                                                        <ContentCopy fontSize="small" />
                                                    </IconButton>
                                                </Box>

                                                <Typography variant="body2" color="text.secondary">
                                                    Expires: {new Date(result.data.expiryDate).toLocaleString()}
                                                </Typography>

                                                <Chip label="Success" size="small" sx={{ mt: 1, bgcolor: orangeColor, color: '#fff' }} />
                                            </>
                                        ) : (
                                            <>
                                                <Typography noWrap color="text.secondary" variant="subtitle2">
                                                    Original: {result.originalInput.originalUrl}
                                                </Typography>
                                                <Alert severity="error" sx={{ mt: 1 }}>{result.error}</Alert>
                                            </>
                                        )}
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

export default URLShortenerPage;