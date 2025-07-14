import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box, useMediaQuery, useTheme } from '@mui/material';

function Navigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

    if (location.pathname !== '/shorten' &&
        location.pathname !== '/statistics' &&
        location.pathname !== '/') {
        return null;
    }

    const getCurrentTab = () =>
        location.pathname === '/statistics' ? '/statistics' : '/shorten';

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
                value={getCurrentTab()}
                onChange={(_, newValue) => navigate(newValue)}
                centered
                variant={isMobile ? "fullWidth" : "standard"}
                sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(5px)',
                    '& .MuiTabs-indicator': { bgcolor: 'orange' }
                }}
                TabIndicatorProps={{ style: { backgroundColor: 'orange' } }}
            >
                <Tab label="URL Shortener" value="/shorten" sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }} />
                <Tab label="Statistics" value="/statistics" sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }} />
            </Tabs>
        </Box>
    );
}

export default Navigation;