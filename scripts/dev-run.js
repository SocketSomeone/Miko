const { spawn } = require('child_process');
const { dev } = require('../config.json');
const { isNumber } = require('util');

console.log('STARTING AND WAITING FOR DEBUGGER');

let child = spawn('node', [`--inspect=19229`, './bin/root.js', 'dev', dev.TOKEN, 1, 1, '--no-rabbitmq'], {
	stdio: 'inherit'
});

child.on('error', (error) => console.log(error));

process.on('beforeExit', () => {
	child.kill();
});
