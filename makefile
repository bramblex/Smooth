
source_file = $(shell ls src/)
objects = $(foreach o, $(source_file), $(subst .js, ,$(o)))
target_files = $(foreach o, $(objects), dist/$(o).js)
umdt = 'umdt'

.PHONY: all 
all: dist $(target_files)

dist:
	@mkdir -p dist

$(target_files):dist/%.js:src/%.js
	umdt $< $@

.PHONY: clean
clean:
	rm -r dist
