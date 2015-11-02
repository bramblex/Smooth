
define(['./Class'], function(Class){

  var Position = Class('Position', Object)
    .method('constructor', function(){
      this.offset = 0;
      this.line_nu = 1;
      this.char_nu = 1;
    })
    .method('constructor', function(position){
      this.offset = position.offset;
      this.line_nu = position.line_nu;
      this.char_nu = position.char_nu;
    })
    .method('copy', function(){
      return Position(this);
    })
    .method('set', function(offset){
      this.char_nu = this.char_nu + (offset - this.offset);
      this.offset = offset;
    })
    .method('addLine', function(){
      this.line_nu = this.line_nu + 1;
      this.offset = this.offset + 1;
      this.char_nu = 1;
    })
    .method('inspect', '*', function(){
      return 'Line ' + this.line_nu + ', Char ' + this.char_nu;
    });

  return Position;
});
