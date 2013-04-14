# Patter: Utilities for iterating through arrays using promises

Implementations of common functional methods, such as map, filter and forEach,
but allowing the iteration functions to return promises.

In other words, similar to the excellent [async](https://github.com/caolan/async) module,
but using promises instead of callbacks.

## Example

Using a supported promise implementation, such as [q](https://github.com/kriskowal/q):

```javascript
var promises = require("patter").q();

function iterator(element, index) {
    return promises.resolved(index + ": " + element);
}

return promises.map(["apple", "banana"], iterator)
    .then(function(value) {
        assert.deepEqual(value, ["0: apple", "1: banana"]);
    });
```

## API

Patter doesn't include a promise implementation,
and instead must be created with a promise implemention.

For libraries that are directly supported by Patter,
just call the appropriate function:

* `require("patter").q()` -- use [q](https://github.com/kriskowal/q)
* `require("patter").promise()` -- use [promise](https://github.com/then/promise)
* `require("patter").when()` -- use [when.js](https://github.com/cujojs/when)
* `require("patter").deferred()` -- use [Deferred](https://github.com/medikoo/deferred)

Note that patter does *not* depend on any promise implementation.
In other words, if you want to use, say, q with patter,
make sure that you install both the patter and q modules.

To create an instance of Patter,
call `require("patter")` with a function `createPromise(callback)`,
where `callback` has the signature `callback(resolve, reject)`.
For instance, to use `q` manually:

```javascript
var q = require("q");

function createPromise(func) {
    var deferred = q.defer();
    
    func(
        deferred.resolve.bind(deferred),
        deferred.reject.bind(deferred)
    );
    
    return deferred.promise;
}

var promises = require("patter")(createPromise);

// Use promises.map, promises.forEach, and so on;
```

(Note that the above won't work in older versions of q due to [a bug](https://github.com/kriskowal/q/issues/252).)

### forEach(array, iterator)

Apply `iterator` to every element in `array` in parallel.
If one of the promises returned by an application is rejected,
the overall promise is rejected.

Arguments:

* `array` -- an array to iterate over.
* `iterator(element, index)` -- the iterator is passed each element of the array
  and its index. Should return a promise.

### forEachSeries(array, iterator)

The same as `forEach`,
except that `iterator` is only called on each element once the previous
application of `iterator` has finished.

### map(array, iterator)

Returns a promise of an array of values by applying `iterator` to every element
in `array` in parallel.
If one of the promises returned by an application is rejected,
the overall promise is rejected.

Arguments:

* `array` -- an array to iterate over.
* `iterator(element, index)` -- the iterator is passed each element of the array
  and its index. Should return a promise of the mapped value.

### mapSeries(array, iterator)

The same as `map`,
except that `iterator` is only called on each element once the previous
application of `iterator` has finished.

### filter(array, iterator)

Returns a promise of an array of values that satisfy `iterator`.
If one of the promises returned by an application is rejected,
the overall promise is rejected.

Arguments:

* `array` -- an array to iterate over.
* `iterator(element, index)` -- the iterator is passed each element of the array
  and its index. Should return a promise of a boolean, true if the element
  should be in the new array, false otherwise.

### filterSeries(array, iterator)

The same as `filter`,
except that `iterator` is only called on each element once the previous
application of `iterator` has finished.

### find(array, iterator)

Find an element in `array` that satisfies `iterator`.
`find` runs in parallel, and will return the first matching value to return,
which may not be the first matching value in the array.

Arguments:

* `array` -- an array to iterate over.
* `iterator(element, index)` -- the iterator is passed each element of the array
  and its index. Should return a promise of a boolean.

### findSeries(array, iterator)

The same as `find`,
except that `iterator` is only called on each element once the previous
application of `iterator` has finished.
This means that the value returned is the first matching value in the array.


