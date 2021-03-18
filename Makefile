ESLINT			?= ./node_modules/.bin/eslint
KARMA			?= ./node_modules/.bin/karma
ROLLUP			?= ./node_modules/.bin/rollup

node_modules: package.json package-lock.json
	npm i

.PHONY: eslint
eslint: node_modules
	$(ESLINT) stashbounce.js

.PHONY: check
check: eslint
	$(KARMA) start karma.conf.js $(ARGS)


dist/stashdebounce.js:
	$(ROLLUP) --config rollup.config.js

.PHONY: check
dist: node_modules stashbounce.js dist/stashdebounce.js
