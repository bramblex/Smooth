

all: dist/smooth.js bin/smooth

src/Smooth.web.js: src/Smooth.jison
	cd src && jison Smooth.jison -m amd -o Smooth.web.js

src/Smooth.node.js: src/Smooth.jison
	cd src && jison Smooth.jison -o Smooth.node.js

dist/smooth.js:src/WebWapper.js src/Smooth.web.js src/SmoothAST.js src/SmoothCompiler.js
	-rm dist/smooth.js
	webpack src/WebWapper.js  --config config/webpack.web.js --output-filename dist/smooth.js

bin/smooth: src/CliWapper.js src/Smooth.node.js src/SmoothAST.js src/SmoothCompiler.js
	-rm bin/smooth
	webpack src/CliWapper.js --config config/webpack.node.js --output-filename bin/smooth.tmp
	echo '#!/usr/bin/env node' >> bin/smooth
	cat bin/smooth.tmp >> bin/smooth
	rm bin/smooth.tmp
	chmod u+x bin/smooth

clean:
	-rm bin/smooth
	-rm dist/*
	-rm src/Smooth.web.js
	-rm src/Smooth.node.js
