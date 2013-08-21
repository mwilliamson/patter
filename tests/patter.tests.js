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

test("forEachSeries returns rejected promise if iterator returns rejected promise", function(promises, test) {
    var input = ["apple", "banana"];
    
    var iteratorIndex = 0;
    function iterator(element, index) {
        return promises.rejected(new Error("Hah!"));
    }
    
    test.expect(1);
    return promises.forEachSeries(input, iterator)
        .then(function(value) {
            test.fail("Should be rejected promise");
        }, function(error) {
            test.deepEqual(error.message, "Hah!");
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

// forEach

test("forEach does nothing if array is empty", function(promises, test) {
    function reject() {
        test.fail("Should not be called");
        return promises.rejected(new Error("Hah!"));
    }
    
    test.expect(1);
    return promises.forEach([], reject)
        .then(function(value) {
            test.deepEqual(value, null);
            test.done();
        });
});

test("forEach applies iterator to each element of the array", function(promises, test) {
    var input = ["apple", "banana"];
    
    var iteratorIndex = 0;
    function iterator(element, index) {
        test.equal(index, iteratorIndex);
        test.equal(input[iteratorIndex], element);
        iteratorIndex++;
        return promises.resolved(null);
    }
    
    test.expect(5);
    return promises.forEach(input, iterator)
        .then(function(value) {
            test.deepEqual(value, null);
            test.done();
        });
});

test("forEach returns rejected promise if iterator returns rejected promise", function(promises, test) {
    var input = ["apple", "banana"];
    
    var iteratorIndex = 0;
    function iterator(element, index) {
        return promises.rejected(new Error("Hah!"));
    }
    
    test.expect(1);
    return promises.forEach(input, iterator)
        .then(function(value) {
            test.fail("Should be rejected promise");
        }, function(error) {
            test.deepEqual(error.message, "Hah!");
            test.done();
        });
});

test("forEach returns once all promises have finished", function(promises, test) {
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
    
    return promises.forEach(input, iterator)
        .then(function(value) {
            test.deepEqual(value, null);
            test.done();
        });
});

test("forEach calls iterator on all elements at once", function(promises, test) {
    test.expect(3);
    var inProgress = 0;
    var input = ["apple", "banana"];
    function iterator(element, index) {
        test.equal(inProgress, index);
        inProgress++;
        return promises.create(function(resolve, reject) {
            setTimeout(function() {
                inProgress--;
                resolve(null)
            }, 10);
        });
    }
    
    return promises.forEach(input, iterator)
        .then(function(value) {
            test.deepEqual(value, null);
            test.done();
        });
});

// mapSeries

test("mapSeries returns promise of list of mapped array", function(promises, test) {
    function iterator(element, index) {
        return promises.resolved(index + ": " + element);
    }
    
    test.expect(1);
    return promises.mapSeries(["apple", "banana"], iterator)
        .then(function(value) {
            test.deepEqual(value, ["0: apple", "1: banana"]);
            test.done();
        });
});

// map

test("map returns promise of list of mapped array", function(promises, test) {
    function iterator(element, index) {
        return promises.resolved(index + ": " + element);
    }
    
    test.expect(1);
    return promises.map(["apple", "banana"], iterator)
        .then(function(value) {
            test.deepEqual(value, ["0: apple", "1: banana"]);
            test.done();
        });
});

// filterSeries

test("filterSeries returns promise of filtered array", function(promises, test) {
    function iterator(element, index) {
        return promises.resolved(index % 2 === 0);
    }
    
    test.expect(1);
    return promises.filterSeries(["apple", "banana"], iterator)
        .then(function(value) {
            test.deepEqual(value, ["apple"]);
            test.done();
        });
});

// filter

test("filter returns promise of filtered array", function(promises, test) {
    function iterator(element, index) {
        return promises.resolved(index % 2 === 0);
    }
    
    test.expect(1);
    return promises.filter(["apple", "banana"], iterator)
        .then(function(value) {
            test.deepEqual(value, ["apple"]);
            test.done();
        });
});

// findSeries

test("findSeries returns promise of first matching element", function(promises, test) {
    function iterator(element, index) {
        return promises.create(function(resolve, reject) {
            setTimeout(function() {
                resolve(index % 2 === 1)
            }, (4 - index) * 10);
        });
    }
    
    test.expect(1);
    return promises.findSeries(["apple", "banana", "coconut", "durian"], iterator)
        .then(function(value) {
            test.deepEqual(value, "banana");
            test.done();
        });
});

test("findSeries returns undefined if matching element is not found", function(promises, test) {
    function iterator(element, index) {
        return promises.resolved(false);
    }
    
    test.expect(1);
    return promises.findSeries(["apple", "banana"], iterator)
        .then(function(value) {
            test.strictEqual(value, undefined);
            test.done();
        });
});

// find

test("find returns promise of first-to-return matching element", function(promises, test) {
    function iterator(element, index) {
        return promises.create(function(resolve, reject) {
            setTimeout(function() {
                resolve(index % 2 === 1)
            }, (4 - index) * 10);
        });
    }
    
    test.expect(1);
    return promises.find(["apple", "banana", "coconut", "durian"], iterator)
        .then(function(value) {
            test.deepEqual(value, "durian");
            test.done();
        });
});

test("find returns undefined if matching element is not found", function(promises, test) {
    function iterator(element, index) {
        return promises.resolved(false);
    }
    
    test.expect(1);
    return promises.find(["apple", "banana"], iterator)
        .then(function(value) {
            test.strictEqual(value, undefined);
            test.done();
        });
});

// foldLeft

test("foldLeft returns initial value if array is empty", function(promises, test) {
    function iterator(accumulator, element, index) {
        return "apple";
    }
    
    test.expect(1);
    return promises.foldLeft([], "banana", iterator)
        .then(function(value) {
            test.strictEqual(value, "banana");
            test.done();
        });
});

test("foldLeft applies function to accumulator and each value from left-to-right", function(promises, test) {
    function iterator(accumulator, element, index) {
        return promises.resolved(accumulator + index + element);
    }
    
    test.expect(1);
    return promises.foldLeft(["apple", "banana"], "|", iterator)
        .then(function(value) {
            test.strictEqual(value, "|0apple1banana");
            test.done();
        });
});



function test(name, func) {
    var impls = ["promise", "q", "when", "deferred"];
    
    impls.forEach(function(impl) {
        exports[impl + ": " + name] = function(test) {
            var promises = patter[impl]();
            func(promises, test);
        };
    });
}
