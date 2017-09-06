var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.join(__dirname, 'client/public');
var APP_DIR = path.join(__dirname, 'client/app');



var config = {
	devtools:"eval-source-map",
	
	entry: [
		APP_DIR + '/index.js'
		],
	output: {
		path: BUILD_DIR,
		filename: 'bundle.js'
	},
	resolve: {
		root: [path.resolve(__dirname, 'client/app'), path.resolve(__dirname, 'node_modules')],
		extensions: ['', '.js']
	},
	module: {
		loaders: [
			{
				test: /\.js?/,
				include: APP_DIR,
				loader: 'babel-loader',
				query: {
					presets: ['react', 'es2015', 'stage-0'],
					plugins: ['react-html-attrs', 'transform-class-properties']
				}
			},
			{
				test: /\.css$/,
				include: path.join(__dirname),
				// APP_DIR,
				loader: "style-loader!css-loader!autoprefixer-loader",
				exclude: [ /public/]
			},
			
		]
	}

};

module.exports = config;