var tomd = require('to-markdown').toMarkdown,
	tumblr = require('tumblr.js'),
  request = require('request'),
  async = require('async'),
  fs = require('fs'),
  path = require('path'),
	moment = require('moment'),
  util = hexo.util,
  file = util.file2;

hexo.extend.migrator.register('tumblr', function(args, callback) {
  var log = hexo.log, post = hexo.post, config = hexo.config;

  var blogname = args._.shift();
  var key = args._.shift();

//log.i(hexo.config.tumblr);
  var client = tumblr.createClient({consumer_key: key});
  client.posts( blogname, {limit: 50}, function(err, resp) {

    if(err) {
      callback(err);
    }

    var posts = []

    resp.posts.forEach( function(post) {

      var p = {
        id: '',
        data: {},
        attach: []
      }
      var ts = moment.unix(post.timestamp);
      var id = ts.format('YYYY-MM-DD') + '-' + post.slug;
      p.data.tumblr_id = post.id;
      p.data.tumblr_short_url = post.short_url;
      p.data.date = ts.format('YYYY-MM-DD HH:mm:SS');
      
      if(post.source_url) {
        p.data.tumblr_source_url = post.source_url;
      }
      p.data.slug = post.slug || 'tumblr-'+post.id;
      p.data.tags = post.tags;

      p.data.title = p.data.slug;

      p.id = id;

      if(post.type == 'text') {
        p.data.content = tomd(post.body);        
      } else if(post.type == 'photo') {
        p.data.content = '';
        post.photos.forEach(function(photo) {
          p.data.content += '{% asset_img .tumblr '+path.basename(photo.original_size.url)+' 600 %}\n';
          p.attach.push(photo.original_size.url);
        })
        p.data.content += tomd(post.caption);
      }
      
      if(p.data.content) {
        posts.push(p);
      }
    });
    async.eachSeries(posts, function(item, next){
      log.i('Processing %s', item.id);
      async.waterfall([
        function(next) {
          post.create(item.data, next);
        },
        function(filename, contents, next) {
           if (!config.post_asset_folder) return next();

          var target = filename.substring(0, filename.length - path.extname(filename).length);
          async.each(item.attach, function(itattach, next) {
            log.i('Downloading %s', itattach)
            request(itattach)
              .pipe(fs.createWriteStream(path.join(target, path.basename(itattach))))
              .on('finish', next);
          }, next);
        }
        ], next);
    }, function(err) {
      if (err) return callback(err);

      log.i('%d posts migrated.', posts.length);
      callback();
    });
  })
});