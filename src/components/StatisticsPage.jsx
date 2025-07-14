import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip, IconButton, Collapse, Link, useMediaQuery
} from '@mui/material';
import { ExpandMore, ExpandLess, ContentCopy } from '@mui/icons-material';
import URLService from '../services/urlService';
import FrontendLogger from '../utils/logger';

function StatisticsPage() {
    const [urls, setUrls] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const logger = new FrontendLogger();
    const isMobile = useMediaQuery('(max-width:600px)');

    useEffect(() => {
        (async () => {
            await logger.info('page', 'Statistics page loaded');
            setUrls(URLService.getAllUrls());
        })();
    }, []);

    const handleShortUrlClick = async (shortCode, originalUrl) => {
        await URLService.recordClick(shortCode, 'statistics-page', 'localhost');
        setUrls(URLService.getAllUrls());
        window.open(originalUrl, '_blank');
    };

    const formatTime = dateString => new Date(dateString).toLocaleString();
    const isExpired = date => new Date() > new Date(date);

    return (
        <Box>
            <Typography variant="h4" gutterBottom align="center" sx={{ color: '#ff6d00' }}>URL Statistics</Typography>

            {!urls.length ? (
                <Card><CardContent><Typography align="center" color="text.secondary">No URLs shortened yet.</Typography></CardContent></Card>
            ) : (
                <Card sx={{ borderColor: '#ff6d00', borderTop: '3px solid #ff6d00' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#ff6d00' }}>All Shortened URLs ({urls.length})</Typography>

                        <TableContainer component={Paper}>
                            <Table size={isMobile ? "small" : "medium"}>
                                <TableHead sx={{ backgroundColor: '#fff3e0' }}>
                                    <TableRow>
                                        <TableCell>Short URL</TableCell>
                                        <TableCell>Original URL</TableCell>
                                        {!isMobile && <TableCell>Created</TableCell>}
                                        <TableCell>Expires</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Clicks</TableCell>
                                        <TableCell>Details</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {urls.map(url => (
                                        <React.Fragment key={url.id}>
                                            <TableRow>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Link component="button" variant="body2" onClick={() => handleShortUrlClick(url.shortCode, url.originalUrl)}
                                                            sx={{ textAlign: 'left', color: '#f57c00' }}>
                                                            {isMobile ? url.shortCode : url.shortUrl}
                                                        </Link>
                                                        <IconButton size="small" onClick={async () => {
                                                            await navigator.clipboard.writeText(url.shortUrl);
                                                            await logger.info('component', 'URL copied');
                                                        }}>
                                                            <ContentCopy fontSize="small" sx={{ color: '#ff9800' }} />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography noWrap sx={{ maxWidth: isMobile ? 100 : 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {url.originalUrl}
                                                    </Typography>
                                                </TableCell>
                                                {!isMobile && <TableCell>{formatTime(url.createdAt)}</TableCell>}
                                                <TableCell>{formatTime(url.expiryDate)}</TableCell>
                                                <TableCell>
                                                    <Chip label={isExpired(url.expiryDate) ? 'Expired' : 'Active'}
                                                        color={isExpired(url.expiryDate) ? 'error' : 'success'} size="small" />
                                                </TableCell>
                                                <TableCell>{url.totalClicks}</TableCell>
                                                <TableCell>
                                                    <IconButton size="small" onClick={() => setExpandedRows(prev => ({ ...prev, [url.id]: !prev[url.id] }))}
                                                        disabled={!url.clicks.length} sx={{ color: '#ff9800' }}>
                                                        {expandedRows[url.id] ? <ExpandLess /> : <ExpandMore />}
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>

                                            {url.clicks.length > 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={7} sx={{ p: 0 }}>
                                                        <Collapse in={expandedRows[url.id]}>
                                                            <Box sx={{ p: 2, backgroundColor: '#fff8e1' }}>
                                                                <Typography variant="subtitle2" gutterBottom sx={{ color: '#e65100' }}>Click Details</Typography>
                                                                <Table size="small">
                                                                    <TableHead sx={{ backgroundColor: '#ffe0b2' }}>
                                                                        <TableRow>
                                                                            <TableCell>Timestamp</TableCell>
                                                                            <TableCell>Source</TableCell>
                                                                            <TableCell>Location</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {url.clicks.map((click, idx) => (
                                                                            <TableRow key={idx}>
                                                                                <TableCell>{formatTime(click.timestamp)}</TableCell>
                                                                                <TableCell>{click.source}</TableCell>
                                                                                <TableCell>{click.location}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

export default StatisticsPage;