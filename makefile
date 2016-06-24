

all: dist/smooth.js bin/smooth

src/Smooth.jison: src/SmoothAST.js src/SmoothCompiler.js

src/Smooth.js: src/Smooth.jison
	cd src && jison Smooth.jison -m amd

dist/smooth.js: src/Smooth.js
	-rm dist/smooth.js
	webpack src/Smooth.js  --config config/webpack.web.js --output-filename dist/smooth.js.tmp
	echo 'var Smooth = ' >> dist/smooth.js
	cat dist/smooth.js.tmp >> dist/smooth.js
	rm dist/smooth.js.tmp

bin/smooth: src/CliWapper.js src/Smooth.js
	-rm bin/smooth
	webpack src/CliWapper.js --config config/webpack.node.js --output-filename bin/smooth.tmp
	echo '#!/usr/bin/env node' >> bin/smooth
	cat bin/smooth.tmp >> bin/smooth
	rm bin/smooth.tmp
	chmod u+x bin/smooth

clean:
	-rm bin/smooth
	-rm dist/*
	-rm src/Smooth.js
