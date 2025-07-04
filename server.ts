import http, { IncomingMessage } from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let users: { id: number; name: string }[] = [];

try {
    const data = await fs.readFile(path.join(__dirname, 'public', 'users.json'), 'utf8');
    users = JSON.parse(data);
} catch (err) {
    console.log('Error parsing the user.json file', err);
    process.exit(1);
}

import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 7070;

const server = http.createServer((req, res) => {
    const { url, method } = req;

    const logClientInfo = (req: IncomingMessage) => {
        const ip = req.socket.remoteAddress;
        const ua = req.headers['user-agent'];
        const referer = req.headers['referer'];
        const method = req.method;
        const url = req.url;

        console.log(`--- Request Info ---`);
        console.log(`[${new Date().toISOString()}] ${ip} ${method} ${url}`);
        console.log(`User-Agent: ${ua}`);
        if (referer) console.log(`Referer ${referer}`);
    };

    try {
        if (!url) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Missing URL' }));
        }

        if (method === 'GET') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            if (url === '/') {
                res.end(JSON.stringify({ usage: 'Available paths are /users /user/[id]' }));
            } else if (url === '/users') {
                res.end(JSON.stringify(users));
            } else if (url.match(/\/users\/([0-9]+)$/)) {
                const id = url.split('/')[2];
                const user = users.find((u) => u.id === parseInt(id));

                if (user) {
                    res.end(JSON.stringify(user));
                } else {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: 'User not found' }));
                }
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Route not found' }));
            }
        } else {
            res.statusCode = 405;
            res.end(JSON.stringify({ message: 'Other methods are in production...' }));
            logClientInfo(req);
            console.log(`Status Code: ${res.statusCode}`);
        }
    } catch (err) {
        console.error('Server Error', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
});

server.listen(PORT, () => {
    const addr = server.address();
    console.log('--- Server Info ---');
    if (addr === null) {
        console.log('Server not listening yet');
    } else if (typeof addr === 'string') {
        console.log(`Listening on ${addr}`);
    } else if (typeof addr === 'object') {
        console.log(`Listening on ${addr.address} ${addr.port} (${addr.family})`);
    } else {
        console.log(`Listening on port ${PORT}`);
    }
});

process.on('SIGINT', () => {
    console.log('\n--- Shutting down the server ---\n');
    server.close(() => process.exit(0));
});
