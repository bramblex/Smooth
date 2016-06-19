"use strict";
// module Main

exports.testCode = (function(){
    var fs = require('fs');
    var file_path = "example/test.sm";
    return fs.readFileSync(file_path, {encoding: "utf8"});
})();
