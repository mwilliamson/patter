# Patter: Utilities for iterating through arrays using promises

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
