
src = ./src
target = ./bin/smooth

all:
	pulp build -O --to $(target)
	-closure-compiler --js $(target) --js_output_file $(target)_tmp && mv $(target)_tmp $(target)
	chmod u+x $(target)
