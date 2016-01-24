var models = require('../models'),
	async = require('async');

module.exports = function(callback) {
	async.parallel([
		function(next) {
			models.Image.count({}, next);
		},
		function(next) {
			models.Comment.count({}, next);
		},
		function(next) {
			models.Image.aggregate({ $group: { _id: '1', total: { $sum: '$views' }}}, function(err, results) {
				if(err) throw err;

				if(results.length > 0)
					next(null, results[0].total);
				else
					next(null, 0);
			});
		},
		function(next) {
			models.Image.aggregate({ $group: { _id: '1', total: { $sum: '$likes' }}}, function(err, results) {
				if(err) throw err;

				if(results.length > 0)
					next(null, results[0].total);
				else
					next(null, 0);
			});
		}
		], function(err, results){
			callback(null, {
				images: results[0],
				comments: results[1],
				views: results[2],
				likes: results[3]
			});
		});
};