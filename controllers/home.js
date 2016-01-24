var sidebar = require('../helpers/sidebar'),
	ImageModel = require('../models').Image;

module.exports = {
	index: function(req, res) {
		var model = {
			images: []
		};

		ImageModel.find({}, {}, { sort: { timestamp: -1 }}, function(err, images){
			if(err) throw err;

			model.images = images;
			sidebar(model, function(model){
				res.render('index', model);
			});
		});
	}
};