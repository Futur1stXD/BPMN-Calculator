import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname, 'dist')));
app.use('/src/assets', express.static(path.join(__dirname, 'src', 'assets')));

app.get('*', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '192.168.10.125', () => console.log(`Server has been started on port ${port}...`));