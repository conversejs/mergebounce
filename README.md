# mergebounce

`mergebounce` is a fork of lodash's [debounce](https://lodash.com/docs/4.17.15#debounce) function with the added feature that it'll use the lodash [merge](https://lodash.com/docs/4.17.15#merge)
function to merge all passed in parameters before eventually invoking the debounced inner function.

By doing so, it's possible to combine multiple expensive calls into a single one
without losing state changes that would have been made by individual calls.

For example, let's suppose you'd like to save JSON data to a specific endpoint
on your backend.

By using `mergebounce`, you can combine multiple calls, each with its own JSON
object with potentially different keys and values into a single call with a merged JSON
object.


## options

The default `debounce` options are allowed, as well as the following option:

* `concatArrays`:
    By default arrays will be treated as objects when being merged. When
    merging two arrays, the values in the 2nd arrray will replace the
    corresponding values (i.e. those with the same indexes) in the first array.
    When `concatArrays` is set to `true`, arrays will be concatenated instead.
* `promise`:
    By default, when calling a merge-debounced function that doesn't execute
    immediately, you'll receive the result from its previous execution, or
    `undefined` if it has never executed before. By setting the `promise`
    option to `true`, a promise will be returned instead of the previous
    execution result when the function is debounced. The promise will resolve
    with the result of the next execution, as soon as it happens.
