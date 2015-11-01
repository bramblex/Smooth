
define(['./Class'], function(Class){

  var CharSet = Class('CharSet', String)
    .method('has', function(c){
      return this.indexOf(c) >= 0;
    })
    .method('inspect', '*', function(){
      var char_set = Array.prototype.slice.apply(this);
      var content_str = char_set
        .map(function(i){return JSON.stringify(i)})
        .join(' ');
      return '[ CharSet ' + content_str + ' ]';
    });

  CharSet.WholeCharSet = Class('CharSet', CharSet)
    .method('has', function(c){
      return true;
    })
    .method('inspect', '*', function(){
      return '[ WholeCharSet ]';
    });

  return CharSet;
});
