import { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UsersFilePath = path.join(__dirname, 'public', 'users.json');

export type User = { id: number; name: string };

export async function loadUsers(): Promise<User[]> {
    try {
        const data = await fs.readFile(path.join(__dirname, 'public', 'users.json'), 'utf8');
        return JSON.parse(data) as User[];
    } catch (err) {
        console.error('loadUsers() error', err);
        throw err;
    }
}


// JSON middleware
export const jsonMiddleware = (res: ServerResponse, next: () => void): void => {
    res.setHeader('Content-Type', 'application/json');
    next();
};

// Route handler for GET /users
export const getUsersHandler = (res: ServerResponse, users: User[]): void => {
    res.statusCode = 200;
    res.end(JSON.stringify(users));
};

// Route handler for GET /users/id
export const getUserByIdHandler = (res: ServerResponse, url: string, users: User[]): void => {
    const idStr = url.split('/')[2];
    const id = parseInt(idStr, 10);

    if (isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid User Id' }));
        return;
    }
    const user = users.find((u): boolean => u.id === id);

    if (user) {
        res.statusCode = 200;
        res.end(JSON.stringify(user));
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'User not found' }));
    }
};

// Getting the body
export function getBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject): void => {
        let data = '';
        req.on('data', (chunk: Buffer): void => { data +=  chunk.toString(); });
        req.on('end', (): void => resolve(data));
        req.on('error', (err: Error): void => { reject(err); });
    });
}



//Route handler for POST /users/
export async function createUserHandler(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
        const body = await getBody(req);
        const newUser: User = JSON.parse(body);
        const users = await loadUsers();
        users.push(newUser);
        await saveNewUser(users);

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'User saved', user: newUser }));
        console.log('\n-- New User Added --\n');
        console.log(`Id: ${newUser.id} Name: ${newUser.name}`);
    } catch (err) {
        console.error('Error while adding new user', err);
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid request or Internal issue' }));
    }
}

// Route handler for GET /
export const landingPageHandler = (res: ServerResponse): void => {
    res.statusCode = 200;
    res.end(JSON.stringify({ message: 'Welcome to myApi. Available routes: /users, /users/id' }));
};

// Logger middleware
export const logClientInfo = (req: IncomingMessage, next: () => void): void => {
    const ip = req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    const referer = req.headers['referer'];
    const method = req.method;
    const url = req.url;

    console.log(`\n=== Request Info ===\n`);
    console.log(`[${new Date().toISOString()}] ${ip} ${method} ${url}`);
    console.log(`User-Agent: ${ua}`);
    if (referer) console.log(`Referer ${referer}`);

    next();
};

// Not found handler
export const notFoundHandler = (res: ServerResponse): void => {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Route not found' }));
};

// Save new Users
export async function saveNewUser(user: User[]): Promise<void> {
    await fs.writeFile(UsersFilePath, JSON.stringify(user, null, 2), 'utf8');
}
