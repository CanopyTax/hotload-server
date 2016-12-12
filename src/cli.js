#!/usr/bin/env node

const commander = require('commander');
const server = require('./server.js');

commander
.option('--dir <path>')
.option('--ssl')
.option('--key [key]')
.option('--cert [cert]')
.option('--cors')
.option('-p, --port <port>')
.option('-d, --debug', 'See debug output')
.parse(process.argv)

const config = {
	dir: commander.dir,
	ssl: commander.ssl,
	key: commander.key,
	cert: commander.cert,
	debug: commander.debug,
	port: commander.port || 8080,
	cors: commander.cors,
};

if (config.debug) {
	console.log('config', config)
}

server(config);
