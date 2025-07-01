import http from 'http';

const PORT = 7070;

const server = http.createServer((req, res) => {
    res.writeHead(500, { 'Content-type': 'application/json' });
    res.end(JSON.stringify({ message: 'Server error' }));
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
