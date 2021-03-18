/*global describe, it, expect, mergebounce */

describe("mergebounce", function () {

  it("merges passed in parameters before invoking the function", function (done) {
    let invokedData;
    const debounced = mergebounce(function (data) { invokedData = data }, 10);
    debounced({'a': [{ 'b': 2 }, { 'd': 4 }]});
    debounced({'a': [{ 'c': 3 }, { 'e': 5 }]});

    setTimeout(() => {
      expect(invokedData).toEqual({ 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] })
      done();
    }, 15);

  });
});
