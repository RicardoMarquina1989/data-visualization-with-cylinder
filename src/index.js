import { createRoot } from 'react-dom/client'
import './styles.css'
import { App } from './App'
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';

createRoot(document.getElementById('root')).render(
    <MantineProvider>
        <App />
    </MantineProvider>)
