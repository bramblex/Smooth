

all: dist/smooth.js bin/smooth

src/Smooth.jison: src/*

src/Smooth.js: src/Smooth.jison
	cd src && jison Smooth.jison

dist/smooth.js: src/Smooth.js
	webpack src/Smooth.js  --config config/webpack.web.js --output-filename dist/smooth.js

bin/smooth: src/CliWapper.js src/Smooth.js
	webpack src/CliWapper.js --config config/webpack.node.js --output-filename bin/smooth.tmp 
	echo '#!/usr/bin/env node' >> bin/smooth
	cat bin/smooth.tmp >> bin/smooth
	rm bin/smooth.tmp
	chmod u+x bin/smooth

clean:
	-rm bin/*
	-rm dist/*
	-rm src/Smooth.js
