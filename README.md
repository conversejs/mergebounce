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
