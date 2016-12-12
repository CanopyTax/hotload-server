var express = require('express'),
	fs = require('fs'),
	https = require('https'),
	serveStatic = require('serve-static'),
	url = require('url'),
	cors = require('cors'),
	bodyParser = require('body-parser'),
	chokidar = require('chokidar');

let hotReloads = [];
let isWatching = false;

module.exports = function(config) {
	var app = express();

	if (config.cors) {
		app.use(cors());
		app.options('*', cors());
	}

	app.use(serveStatic(config.dir, {'index': false}));
	app.use(bodyParser.json());

	app.get('/hot-reload', function(req, res) {
		res.writeHead(200, {
			'Connection': 'keep-alive',
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache'
		});

		req.on('close', function(err) {
			hotReloads = hotReloads.filter(hotReload => hotReload !== res);
			config.debug && console.log(`Subscriber closed connection (num of subscribers is ${hotReloads.length})`);
		})

		hotReloads.push(res);
		config.debug && console.log(`New subscriber to changes (num of subscribers is ${hotReloads.length})`);

		if (!isWatching) {
			isWatching = true;
			chokidar.watch(config.dir, {ignored: /.*.js.map/}).on('change', fileChanged);
		}
	});

	if (config.ssl) {
		const sslOptions = {};
		if (config.key) {
			sslOptions.key = fs.readFileSync(config.key);
		}

		if (config.cert) {
			sslOptions.cert = fs.readFileSync(config.cert);
		}

		https.createServer(sslOptions, app).listen(config.port);
	} else {
		app.listen(config.port);
	}

	console.log("Hotload server running");

	function fileChanged(path) {
		for (let i=0; i<hotReloads.length; i++) {
			config.debug && console.log(`Hot reloading ${path}`);
			hotReloads[i].write('data: ' + JSON.stringify({ hotReload: path }) + '\n\n');
		}
	}
}

