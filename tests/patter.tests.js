var q = require("q");

var patter = require("../");


// resolved
test("resolved creates a promise with a given value", function(promises, test) {
    test.expect(1);
    return promises.resolved(42)
        .then(function(value) {
            test.equal(value, 42)
            test.done();
        }, function() {
            test.fail("Should not have failure")
        });
});


// rejected
test("rejected creates a promise with an error", function(promises, test) {
    test.expect(1);
    return promises.rejected(new Error("Oh dear"))
        .then(function(value) {
            test.fail("Should not have failure");
        }, function(error) {
            test.equal("Oh dear", error.message)
            test.done();
        });
});

// forEachSeries

test("forEachSeries does nothing if array is empty", function(promises, test) {
    function reject() {
        test.fail("Should not be called");
        return promises.rejected(new Error("Hah!"));
    }
    
    test.expect(1);
    return promises.forEachSeries([], reject)
        .then(function(value) {
            test.deepEqual(value, null);
            test.done();
        });
});

test("forEachSeries applies iterator to each element of the array", function(promises, test) {
    var input = ["apple", "banana"];
    
    var iteratorIndex = 0;
    function iterator(element, index) {
        test.equal(index, iteratorIndex);
        test.equal(input[iteratorIndex], element);
        iteratorIndex++;
        return promises.resolved(null);
    }
    
    test.expect(5);
    return promises.forEachSeries(input, iterator)
        .then(function(value) {
            test.deepEqual(value, null);
            test.done();
        });
});

test("forEachSeries returns once all promises have finished", function(promises, test) {
    test.expect(3);
    
    var input = ["apple", "banana"];
    function iterator(element, index) {
        return promises.create(function(resolve, reject) {
            setTimeout(function() {
                test.ok(true);
                resolve(null)
            }, 10);
        });
    }
    
    return promises.forEachSeries(input, iterator)
        .then(function(value) {
            test.deepEqual(value, null);
            test.done();
        });
});

test("forEachSeries only calls iterator once previous has finished", function(promises, test) {
    test.expect(5);
    var inProgress = 0;
    var input = ["apple", "banana"];
    function iterator(element, index) {
        test.equal(inProgress, 0);
        inProgress++;
        return promises.create(function(resolve, reject) {
            setTimeout(function() {
                inProgress--;
                test.equal(inProgress, 0);
                resolve(null)
            }, 10);
        });
    }
    
    return promises.forEachSeries(input, iterator)
        .then(function(value) {
            test.deepEqual(value, null);
            test.done();
        });
});

function test(name, func) {
    var impls = ["promise", "q"];
    
    impls.forEach(function(impl) {
        exports[impl + ": " + name] = function(test) {
            var promises = patter[impl]();
            func(promises, test);
        };
    });
}
