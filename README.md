# mergebounce

`mergebounce` is a fork of lodash's [debounce](https://lodash.com/docs/4.17.15#debounce) function with the added feature that it'll use the lodash [merge](https://lodash.com/docs/4.17.15#merge)
function to merge all passed in parameters before eventually invoking the debounced inner function.

By doing so, it's possible to combine multiple expensive calls into a single one
without losing state changes that would have been made by individual calls.


## usecases

### Batching expensive writes

Imagine you have a frontend app that stores data in IndexedDB via [localForage](https://localforage.github.io/localForage).
Writes to IndexedDB are slow, which can slow down your whole app.

You can increase performance by batching writes together.

One way to do this, is to install [localForage-setItems](https://github.com/localForage/localForage-setItems)
and then to use `mergebounce` to combine multple calls to `setItems` into a
single one.

```javascript
const debouncedSetItems = mergebounce(
    items => store.setItems(items),
    50,
    {'promise': true}
);

function save (json) {
    const items = {}
    items[json.id)] = json;
    return debouncedSetItems(items);
}
```

Now `save` can be called many times, but the actual writes (calls to
`setItems`) will be far fewer.


### Reducing requests

Let's suppose you have a chat app and as chat messages appear you want to fetch
user data for new message authors.

When you initially load the chat, there might be a 100 messages with 50
authors.

Instead of making a request for every incoming message that has an
as yet unknown author, you can mergebounce the function and combine multiple
calls into a single request.

For example:

```javascript
async function _fetchUserData(nicknames) {
  const response = await fetch('/user/data', {
    body: JSON.stringify({nicknames}),
    headers: { 'Content-Type': 'application/json' },
  });

  data.forEach(userdata => getUser().update(userdata));
}

const fetchUserData = mergebounce(_fetchUserData, 250, {'concatArrays': true});

// The following calls with result in one request with all the nicnames
// concatenated into one array
fetchUserData(['coolguy69', 'ilikecats', 'dielan']);
fetchUserData(['coolboymew']);
fetchUserData(['donkeykong']);
```

## options

The default `debounce` options are allowed, as well as the following option:

* `concatArrays`:
    By default arrays will be treated as objects when being merged. When
    merging two arrays, the values in the 2nd arrray will replace the
    corresponding values (i.e. those with the same indexes) in the first array.
    When `concatArrays` is set to `true`, arrays will be concatenated instead.
* `dedupeArrays`:
    This option is similar to `concatArrays`, except that the concatenated
    array will also be deduplicated. Thus any entries that are concatenated to the
    existing array, which are already contained in the existing array, will
    first be removed.
* `promise`:
    By default, when calling a mergebounced function that doesn't execute
    immediately, you'll receive the result from its previous execution, or
    `undefined` if it has never executed before. By setting the `promise`
    option to `true`, a promise will be returned instead of the previous
    execution result when the function is debounced. The promise will resolve
    with the result of the next execution, as soon as it happens.
