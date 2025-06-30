const fs = require('fs');
const http = require('http');
const PORT = 3000;
http
  .createServer((req, res) => {
    if (req.url === '/') {
      fs.readFile('./index.html', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading file');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    } else if (req.url === '/api') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Hello, world!' }));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  })
  .listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
  });
