import http, { IncomingMessage, ServerResponse } from 'http';
import {
    User,
    loadUsers,
    jsonMiddleware,
    getUsersHandler,
    getUserByIdHandler,
    createUserHandler,
    landingPageHandler,
    notFoundHandler,
    logClientInfo,
} from './utils.ts';

import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 7070;

async function startServer(): Promise<void> {
    let users: User[] = [];

    try {
        users = await loadUsers();
    } catch (err) {
        console.error('Couldnt load users', err);
        process.exit(1);
    }

    const server = http.createServer((req, res): void => {
        const { url, method } = req;
        try {
            logClientInfo(req, (): void => {
                jsonMiddleware(
                    res,
                    (): ServerResponse<IncomingMessage> | undefined => {
                        if (!url) {
                            res.statusCode = 400;
                            return res.end(
                                JSON.stringify({ error: 'URL Not Found' }),
                            );
                        }
                        if (url === '/' && method === 'GET') {
                            landingPageHandler(res);
                        } else if (url === '/users' && method === 'GET') {
                            getUsersHandler(res, users);
                        } else if (
                            /^\/users\/\d+$/.test(url) &&
                            method === 'GET'
                        ) {
                            getUserByIdHandler(res, url, users);
                        } else if (url === '/users' && method === 'POST') {
                            createUserHandler(req, res);
                        } else {
                            notFoundHandler(res);
                        }
                    },
                );
            });
        } catch (err) {
            console.error('Server Error', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
    server.listen(PORT, (): void => {
        const addr = server.address();
        console.log('\n=== Server Info ===\n');
        if (addr === null) {
            console.log('Server not listening yet');
        } else if (typeof addr === 'string') {
            console.log(`Listening on ${addr}`);
        } else if (typeof addr === 'object') {
            console.log(
                `Listening on ${addr.address} ${addr.port} (${addr.family})`,
            );
        } else {
            console.log(`Listening on port ${PORT}`);
        }
    });

    // Handling signals
    process.on('SIGINT', (): void => {
        console.log('\n=== Shutting Down The Server ===\n');
        server.close();
        process.exit(0);
    });
}

// Starting the server
startServer().catch((err): void => {
    console.error('Top-level crash', err);
    process.exit(1);
});
