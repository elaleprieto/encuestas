"use strict";
var express = require('express');
var bodyParser = require('body-parser');

var options = {
	extensions: ['htm', 'html'],
	maxAge: '1d',
	setHeaders: function (res, path, stat) {
		res.set('x-timestamp', Date.now())
	}
};

exports.initApp = function() {
	
	var app = express();
	app.use(express.static(__dirname + '/static', options));


	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());

	app.use(function (peticion, respuesta, siguiente) {
		console.log("recibida petición: " + peticion.method + " " + peticion.url);
		if (peticion.body) {
			console.log("body: " + JSON.stringify(peticion.body));
		}
		siguiente();
	});
	return app;
}

exports.initRouter = function(app) {
	var router = express.Router();
	app.use(router);
	return router;
}

exports.initIO = function(app){
	var server = require('http').Server(app);
	var io = require('socket.io')(server);
	var sockets = [];
	function conectar(socket) {
		console.log("Conectando con: " + socket.client.conn.remoteAddress);
		sockets.push(socket);
		var saludo = {
			serverPid: process.pid,
			date: new Date()
		};
		socket.emit('wellcome', saludo);
		console.log("Enviado saludo " + JSON.stringify(saludo));
		socket.on('postedData', function (data) {
			console.log("Un cliente ha actualizado algo" );
			emitirCanalMensaje("updateTutti",saludo);
		});
	}
	io.on("connect", conectar);

	function emitirCanalMensaje(canal, mensaje) {
		console.log(new Date().toLocaleTimeString() + " " + canal + " : " + mensaje);
		sockets.forEach(function (socket) {
			socket.emit(canal, mensaje);
		});
	}
	return server;
}
