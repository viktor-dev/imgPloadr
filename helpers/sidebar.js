var Stats = require('./stats'),
	Images = require('./images'),
	Comments = require('./comments'),
	async = require('async');

module.exports = function(model, callback) {
	async.parallel([ Stats, Images.popular,	Comments.newest ], function(err, results){
			model.sidebar = {
				stats: results[0],
				popular: results[1],
				comments: results[2]
			};
			callback(model);
		});
};