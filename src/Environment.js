define(['./Class'], function(Class){

  var Environment = Class('Environment', Object)
    .method('constructor', function(){
      this.prefix = 'id_';
      this.parent = this;
      this.content = {};
    })
    .method('constructor', function(env){
      this.prefix = env.prefix;
      this.parent = env;
      this.content = Object.create(env.content);
    })
    .method('create', function(){
      return Environment(this);
    })
    .method('get', function(id){
      return this.content[this.prefix+id];
    })
    .method('set', function(id, value){
      this.content[this.prefix+id] = value;
    });

  return Environment;
});
