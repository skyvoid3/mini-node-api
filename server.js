import http from 'http';

const PORT = process.env.PORT || 7070;

// Create instanse of http.Server
const server = http.createServer((req, res) => {
    try { // Creating a JSON of req data to send back to client
        const hostInfo = server.address();
        const responseData = {
            headers: req.headers,
            ip: req.socket.remoteAddress,
            method: req.method,
            url: req.url,
            serverInfo: hostInfo
        };
        // Setting the headers
        res.writeHead(200, { 'Content-Type': 'application/json' });
        // Sending the last chunk of data
        res.end(JSON.stringify(responseData));

    } catch (err) { // Handling errors
        console.error('Internal Server Error', err);

        // Send an error response to the client
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
});

// Server listens for errors and closes
server.on('error', (err) => {
    console.error('Server error', err);
    server.close();
    process.exit(1);
});

// Server Listening on PORT (7070)
server.listen(PORT, '::1', () => {
    const addr = server.address();
    console.log(`Listening on ${addr.address}:${addr.port} (${addr.family})`);
});


