var fs = require('fs'),
	path = require('path'),
	sidebar = require('../helpers/sidebar'),
	Models = require('../models'),
	md5 = require('MD5');

module.exports = {
	index: function(req, res) {
		var model = {
			image: {},
			comments: []
		};

		Models.Image.findOne({ filename: { $regex: req.params.image_id }}, function(err, image){
			if(err) throw err;

			if(image) {
				image.views++;
				model.image = image;
				image.save();

				Models.Comment.find({ image_id: image._id }, {}, { sort: { timestamp: 1 }}, function(err, comments){
					if(err) throw err;

					model.comments = comments;

					sidebar(model, function(model){
						res.render('image', model);
					});
				});
			} else {
				res.redirect('/');
			}
		});

	},
	create: function(req, res) {
		var saveImage = function() {
			var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
				imgUrl = '';

			for(var i=0; i<6; i++) {
				imgUrl += possible.charAt(Math.floor(Math.random()*possible.length));
			}

			Models.Image.find({ filename: imgUrl }, function(err, images){
				if(images.length > 0) {
					saveImage();
				} else {
					var tempPath = req.file.path,
						ext = path.extname(req.file.originalname).toLowerCase(),
						targetPath = path.resolve('./public/upload/' + imgUrl + ext);

					if(ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
						fs.rename(tempPath, targetPath, function(err) {
							if(err) throw err;

							var newImg = Models.Image({
								title: req.body.title,
								description: req.body.description,
								filename: imgUrl + ext
							});
							newImg.save(function(err, image){
								console.log('Successfully inserted image: ' + image.filename);
								res.redirect('/images/' + image.uniqueId);
							});
						});
					} else {
						fs.unlink(tempPath, function(err){
							if(err) throw err;

							res.json(500, {error: 'Only image files are allowed'});
						});
					}
				}
			});
		}

		saveImage();
	},
	like: function(req, res) {
		Models.Image.findOne({ filename: { $regex: req.params.image_id }}, function(err, image){
			if(!err && image) {
				image.likes++;

				image.save(function(err, image){
					if(err) {
						res.json(err);
					} else {
						res.json({ likes: image.likes });
					}
				});
			}
		});
	},
	comment: function(req, res) {
		Models.Image.findOne({ filename: { $regex: req.params.image_id }}, function(err, image){
			if(!err && image) {
				var newComment = Models.Comment(req.body);
				newComment.gravatar = md5(newComment.email);
				newComment.image_id = image._id;
				newComment.save(function(err, comment){
					if(err) throw err;

					res.redirect('/images/' + image.uniqueId + '#' + comment._id);
				});
			} else {
				res.redirect('/');
			}
		});
	},
	remove: function(req, res) {
		Models.Image.findOne({ filename: { $regex: req.params.image_id }}, function(err, image){
			if(err) throw err;

			fs.unlink(path.resolve('./public/upload/' + image.filename), function(err){
				if(err) throw err;

				Models.Comment.remove({ image_id: image._id }, function(err){
					image.remove(function(err){
						if(!err)
							res.json(true);
						else
							res.json(false);
					});
				});
			});
		});
	}
};