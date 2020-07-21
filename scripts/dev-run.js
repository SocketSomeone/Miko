console.clear();

const { spawn } = require('child_process');
const { dev } = require('../config.json');

let child = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'build'], {
	stdio: 'inherit'
});

child.on('error', (error) => console.log(error));

child.on('close', () => {
	console.log('STARTING AND WAITING FOR DEBUGGER');

	child = spawn('node', [`--inspect=19229`, './bin/root.js', dev.TOKEN], {
		stdio: 'inherit'
	});

	child.on('error', (error) => console.log(error));
});
