import { createServer } from 'http';

// Create a basic HTTP server
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  
  const data = {
    message: 'Server is running successfully!',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  };
  
  res.end(JSON.stringify(data, null, 2));
});

// Listen on port 5051
const PORT = 5051;
server.listen(PORT, () => {
  console.log(`Simple server running at http://localhost:${PORT}`);
  console.log('Try accessing it in your browser!');
}); 