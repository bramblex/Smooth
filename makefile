
source_file = $(shell ls src/)
objects = $(foreach o, $(source_file), $(subst .js, ,$(o)))
target_files = $(foreach o, $(objects), dist/$(o).js)
umdt = 'umdt'

.PHONY: all 
all: modules

dist:
	@mkdir -p dist

.PHONY: modules
modules: dist $(target_files) 

$(target_files):dist/%.js:src/%.js
	umdt $< $@

.PHONY: clean
clean:
	rm -r dist

.PHONY: test
test: all
	node dist/Main.js

.PHONY: run
run: test
	node ./test_dist.js
