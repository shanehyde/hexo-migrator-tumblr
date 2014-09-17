var tomd = require('to-markdown').toMarkdown,
	tumblr = require('tumblr.js'),
	moment = require('moment'),
  util = hexo.util,
  file = util.file2;

var capitalize = function(str){
  return str[0].toUpperCase() + str.substring(1);
};

hexo.extend.migrator.register('tumblr', function(args, callback) {
  var log = hexo.log;

  var blogname = args._.shift();
  var key = args._.shift();

//log.i(hexo.config.tumblr);
  var client = tumblr.createClient({consumer_key: key});
  client.posts( blogname, {limit: 50}, function(err, resp) {

    if(err) {
      callback(err);
    }

    var posts = {}

    resp.posts.forEach( function(post) {

      var p = {
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
      if(post.slug) {
        p.data.slug = post.slug;
      }
      p.data.tags = post.tags;

      log.i('Processing %s', id)

      if(post.type == 'text') {
        p.data.content = tomd(post.body);        
      } else if(post.type == 'photo') {
        p.data.content = tomd(post.caption);
        post.photos.forEach(function(photo) {
          p.attach.push(photo.original_size.url);
        })
      }
      log.i(p);
    });
    callback();
  })
});