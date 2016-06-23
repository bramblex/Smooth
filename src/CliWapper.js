

var fs = require('fs');
var path = require('path');
var Smooth = require('./Smooth');
var source_path = process.argv[2];

if (!source_path){
    console.log('Usage: smooth <file_path>');
} else {
    var source = fs.readFileSync(path.normalize(source_path), 'utf8');
    fs.writeFileSync(path.basename(source_path, '.sm')+'.js', Smooth.parse(source), 'utf8');
};
