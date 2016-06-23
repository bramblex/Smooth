

all: src/smooth.js bin/smooth

src/Smooth.jison: src/*

src/Smooth.js: src/Smooth.jison
	cd src && jison Smooth.jison

dist/smooth.js: src/Smooth.js
	webpack src/Smooth.js --output-filename dist/smooth.js

bin/smooth: src/CliWapper.js src/Smooth.js
	webpack src/CliWapper.js --output-filename bin/smooth.tmp
	echo "var fs = require('fs'); var path = require('path');" >> bin/smooth
	cat bin/smooth.tmp >> bin/smooth
	return bin/smooth.tmp
	chomod u+x bin/smooth

clean:
	-rm bin/*
	-rm dist/*
	-rm src/Smooth.js
