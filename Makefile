ESLINT			?= ./node_modules/.bin/eslint
KARMA			?= ./node_modules/.bin/karma

node_modules: package.json package-lock.json
	npm i

.PHONY: eslint
eslint: node_modules
	$(ESLINT) stashbounce.js

.PHONY: check
check: eslint
	$(KARMA) start karma.conf.js $(ARGS)
