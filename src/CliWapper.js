

var fs = require('fs');
var path = require('path');
var Smooth = require('./Smooth.node');
var source_path = process.argv[2];
var target_path = process.argv[3];

if (!source_path){
    console.log('Usage: smooth <source_path> <target_path>');
} else {
    var source = fs.readFileSync(path.normalize(source_path), 'utf8');
    var target_path = target_path || path.basename(source_path, '.sm')+'.js';
    fs.writeFileSync(target_path, Smooth.parse(source), 'utf8');
};
