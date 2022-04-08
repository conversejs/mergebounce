/*global describe, it, expect, mergebounce */

describe("mergebounce", function () {

  it("merges passed in parameters before invoking the function", function (done) {
    let invokedData;
    const mergebounced = mergebounce(data => (invokedData = data), 10);
    mergebounced({'a': [{ 'b': 2 }, { 'd': 4 }]});
    mergebounced({'a': [{ 'c': 3 }, { 'e': 5 }]});

    setTimeout(() => {
      expect(invokedData).toEqual({ 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] })
      done();
    }, 15);
  });

  it("replaces arrays that don't contain objects", function (done) {
    let invokedData;
    const mergebounced = mergebounce(data => (invokedData = data), 10);
    mergebounced([{a: 2}, 4, 5]);
    mergebounced([{a: 1}, 2, 3, 4]);

    setTimeout(() => {
      expect(invokedData).toEqual([{a: 1}, 2, 3, 4]);
      done();
    }, 15);
  });

  it("concatenates arrays if concatArrays option is set", function (done) {
    let invokedData;
    const mergebounced = mergebounce(data => (invokedData = data), 10, {'concatArrays': true});
    mergebounced([{a: 2}, 4, 5]);
    mergebounced([{a: 1}, 2, 3, 4]);

    setTimeout(() => {
      expect(invokedData).toEqual([{a: 2}, 4, 5, {a: 1}, 2, 3, 4]);
      done();
    }, 15);
  });

  it('should dedupe concatenated arrays if "dedupeArrays" is set to true', function (done) {
    let callCount = 0;
    const values = [];

    let mergebounced = mergebounce((value) => {
      ++callCount;
      values.push(value);
    }, 32, {'dedupeArrays': true});

    mergebounced(['a']);
    mergebounced(['a']);
    mergebounced(['b']);
    expect(values.length).toBe(0);
    expect(callCount).toBe(0);

    setTimeout(() => {
      expect(callCount).toBe(1);
      expect(values).toEqual([['a', 'b']]);
      done();
    }, 128);
  });


  it("returns a promise if the promise option is set to true", function (done) {
    const mergebounced = mergebounce(() => {}, 10, {'promise': true});
    const result = mergebounced([{a: 2}, 4, 5]);
    expect(result instanceof Promise).toBe(true);
    expect(result.isResolved).toBe(false);
    setTimeout(() => {
      expect(result.isResolved).toBe(true);
      done();
    }, 15);
  });

  it("merges nested arrays uniquely", function (done) {
    let invokedData;
    const mergebounced = mergebounce(data => (invokedData = data), 10);
    mergebounced({'a': [{ 'b': 2 }, { 'd': [{a: 4}, {b: 6}] }]});
    mergebounced({'a': [{ 'c': 3 }, { 'd': [{a: 5}] }]});

    setTimeout(() => {
      expect(invokedData).toEqual({ 'a': [{ 'b': 2, 'c': 3 }, { 'd': [{a: 5}, {b: 6}] }] })
      done();
    }, 15);
  });

  it("gracefully handles no arguments being passed in", function (done) {
    let invokedData;
    const mergebounced = mergebounce(data => (invokedData = data), 10);
    mergebounced({'a': [{ 'b': 2 }, { 'd': [4] }]});
    mergebounced();

    setTimeout(() => {
      expect(invokedData).toEqual({'a': [{ 'b': 2 }, { 'd': [4] }]})
      done();
    }, 15);
  });

  it("handles multple arguments being passed in", function (done) {
    let args;
    const mergebounced = mergebounce(function () {
      args = Array.from(arguments);
    }, 10);
    mergebounced({ 'b': 2 }, { 'd': [4] });
    mergebounced({ 'c': 3 }, { 'd': [4, 5]});

    setTimeout(() => {
      expect(args).toEqual([{ 'b': 2, 'c': 3 }, { 'd': [4, 5] }])
      done();
    }, 15);
  });

  it("handles multple arguments of variable length", function (done) {
    let args;
    const mergebounced = mergebounce(function () {
      args = Array.from(arguments);
    }, 10);
    mergebounced({ 'b': 2 }, { 'd': [4] });
    mergebounced({ 'c': 3 });

    setTimeout(() => {
      expect(args).toEqual([{ 'b': 2, 'c': 3 }, { 'd': [4] }])
      done();
    }, 15);
  });

  it("keeps track of multple mergebounce functions", function (done) {
    let args1, args2;
    const mergebounced = mergebounce(function () {
      args1 = Array.from(arguments);
    }, 10);

    const mergebounced2 = mergebounce(function () {
      args2 = Array.from(arguments);
    }, 10);

    mergebounced({ 'b': 2 }, { 'd': [4] });
    mergebounced2({'a': [{ 'b': 2 }, { 'd': [4] }]});

    mergebounced({ 'c': 3 });
    mergebounced2({'a': [{ 'c': 3 }, { 'd': [4, 5] }]});

    setTimeout(() => {
      expect(args1).toEqual([{ 'b': 2, 'c': 3 }, { 'd': [4] }])
      expect(args2).toEqual([{ 'a': [{ 'b': 2, 'c': 3 }, { 'd': [4, 5] }] }])
      done();
    }, 15);
  });

  it('should debounce a function', function (done) {
    let callCount = 0;

    let mergebounced = mergebounce(function (value) {
      ++callCount;
      return value;
    }, 32);

    let results = [mergebounced('a'), mergebounced('b'), mergebounced('c')];
    expect(results).toEqual([undefined, undefined, undefined]);
    expect(callCount).toBe(0);

    setTimeout(function() {
      expect(callCount).toBe(1);
      const results = [mergebounced(['d']), mergebounced(['e']), mergebounced(['f'])];
      expect(results).toEqual(['c', 'c', 'c']);
      expect(callCount).toBe(1);
    }, 128);

    setTimeout(function() {
      expect(callCount).toBe(2);
      done();
    }, 256);
  });

  it("should not flush if it wasn't called at least once", function (done) {
    let callCount = 0;
    const mergebounced = mergebounce(() => ++callCount, 15);
    mergebounced.flush();
    expect(callCount).toBe(0);
    done();
  });

  it('should resolve when flushing', function(done) {
    let callCount = 0;
    const mergebounced = mergebounce(() => ++callCount, 0, {promise: true});

    mergebounced();
    mergebounced();
    expect(callCount).toBe(0);

    mergebounced.flush().then(() => {
      expect(callCount).toBe(1);
      done();
    });
  });

  it('should not immediately call `func` when `wait` is `0`', function(done) {
    let callCount = 0;
    const mergebounced = mergebounce(function() { ++callCount; }, 0);

    mergebounced();
    mergebounced();
    expect(callCount).toBe(0);

    setTimeout(function() {
      expect(callCount).toBe(1);
      done();
    }, 5);
  });

  it('should apply default options', function(done) {
    let callCount = 0;
    const mergebounced = mergebounce(() => callCount++, 32, {});

    mergebounced();
    expect(callCount).toEqual(0);

    setTimeout(function() {
      expect(callCount).toEqual(1);
      done();
    }, 64);
  });

  it('should support a `maxWait` option', function(done) {
    let callCount = 0;

    const mergebounced = mergebounce(function(value) {
      ++callCount;
      return value;
    }, 32, { 'maxWait': 64 });

    mergebounced();
    mergebounced();
    expect(callCount).toEqual(0);

    setTimeout(function() {
      expect(callCount).toEqual(1);
      mergebounced();
      mergebounced();
      expect(callCount).toEqual(1);
    }, 128);

    setTimeout(function() {
      expect(callCount).toEqual(2);
      done();
    }, 256);
  });

  it('should support `maxWait` in a tight loop', function(done) {
    let limit = 320,
        withCount = 0,
        withoutCount = 0;

    const withMaxWait = mergebounce(function() {
      withCount++;
    }, 64, { 'maxWait': 128 });

    let withoutMaxWait = mergebounce(function() {
      withoutCount++;
    }, 96);

    let start = +new Date;
    while ((new Date - start) < limit) {
      withMaxWait();
      withoutMaxWait();
    }
    let actual = [Boolean(withoutCount), Boolean(withCount)];
    setTimeout(function() {
      expect(actual).toEqual([false, true]);
      done();
    }, 1);
  });

  it('should queue a trailing call for subsequent mergebounced calls after `maxWait`', function(done) {
    let callCount = 0;

    let mergebounced = mergebounce(() => ++callCount, 200, { 'maxWait': 200 });

    mergebounced();

    setTimeout(mergebounced, 190);
    setTimeout(mergebounced, 200);
    setTimeout(mergebounced, 210);

    setTimeout(function() {
      expect(callCount).toEqual(2);
      done();
    }, 500);
  });

  it('should cancel `maxDelayed` when `delayed` is invoked', function(done) {
    let callCount = 0;

    let mergebounced = mergebounce(function() {
      callCount++;
    }, 32, { 'maxWait': 64 });

    mergebounced();

    setTimeout(function() {
      mergebounced();
      expect(callCount).toEqual(1);
    }, 128);

    setTimeout(function() {
      expect(callCount).toEqual(2);
      done();
    }, 192);
  });
});
