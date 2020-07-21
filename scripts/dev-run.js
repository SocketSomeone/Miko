const { spawn } = require('child_process');
const { dev } = require('../config.json');

console.log('STARTING AND WAITING FOR DEBUGGER');

child = spawn('node', [`--inspect=19229`, './bin/root.js', 'dev', dev.TOKEN, 1, 1], {
	stdio: 'inherit'
});

child.on('error', (error) => console.log(error));
