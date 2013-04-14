exports = module.exports = createUtilities;

exports.promise = function() {
    return createUtilities(require("promise"));
};

exports.q = function() {
    var q = require("q");
    
    function createPromise(func) {
        var deferred = q.defer();
        
        // Fix for issue #252: https://github.com/kriskowal/q/issues/252
        var completed = false;
        
        function resolve(value) {
            if (!completed) {
                completed = true;
                deferred.resolve(value);
            }
        }
        
        function reject(error) {
            if (!completed) {
                completed = true;
                deferred.reject(error);
            }
        }
        
        func(resolve, reject);
        
        return deferred.promise;
    }
    
    return createUtilities(createPromise);
};

exports.when = function() {
    var when = require("when");

    function createPromise(func) {
        var deferred = when.defer();
        
        func(
            deferred.resolve.bind(deferred),
            deferred.reject.bind(deferred)
        );
        
        return deferred.promise;
    }
    
    return createUtilities(createPromise);
};

exports.deferred = function() {
    var deferred = require("deferred");

    function createPromise(func) {
        var def = deferred();
        
        func(
            def.resolve.bind(def),
            def.reject.bind(def)
        );
        
        return def.promise;
    }
    
    return createUtilities(createPromise);
};

function createUtilities(createPromise) {
    function resolved(value) {
        return createPromise(function(resolve, reject) {
            resolve(value);
        });
    }
    
    function rejected(error) {
        return createPromise(function(resolve, reject) {
            reject(error);
        });
    }
    
    function forEachSeries(array, iterator) {
        var index = 0;
        
        function next(value) {
            if (index < array.length && value !== stopValue) {
                var result = iterator(array[index], index);
                index++;
                return result.then(next);
            } else {
                return resolved(null);
            }
        }
        
        return next();
    }
    
    function forEach(array, iterator) {
        if (array.length === 0) {
            return resolved(null);
        }
        
        return createPromise(function(resolve, reject) {
            var completed = 0;
            
            array.forEach(function(element, index) {
                iterator(element, index)
                    .then(function() {
                        completed++;
                        if (completed === array.length) {
                            resolve(null);
                        }
                    }, reject);
            });
        });
    }
    
    function createMapFunc(forEachFunc) {
        return function(array, iterator) {
            var result = [];
            
            return forEachFunc(array, function(element, index) {
                return iterator(element, index)
                    .then(function(mappedElement) {
                        result[index] = mappedElement;
                    });
            }).then(function() {
                return result;
            });
        };
    }
    
    function createFilterFunc(forEachFunc) {
        return function(array, iterator) {
            var result = [];
            
            return forEachFunc(array, function(element, index) {
                return iterator(element, index)
                    .then(function(satisfiesFilter) {
                        result[index] = {
                            value: element,
                            satisfiesFilter: satisfiesFilter
                        };
                    });
            }).then(function() {
                return result
                    .filter(function(resultElement) {
                        return resultElement.satisfiesFilter;
                    })
                    .map(function(resultElement) {
                        return resultElement.value;
                    });
            });
        };
    }
    
    function createFindFunc(forEachFunc) {
        return function(array, iterator) {
            var result = notFound;
            return forEachFunc(array, function(element, index) {
                return iterator(element, index)
                    .then(function(isMatch) {
                        if (isMatch && result === notFound) {
                            result = element;
                            return stopValue;
                        }
                    });
            }).then(function() {
                return result;
            });
        };
    }
    
    return {
        create: createPromise,
        resolved: resolved,
        rejected: rejected,
        forEachSeries: forEachSeries,
        forEach: forEach,
        mapSeries: createMapFunc(forEachSeries),
        map: createMapFunc(forEach),
        filterSeries: createFilterFunc(forEachSeries),
        filter: createFilterFunc(forEach),
        findSeries: createFindFunc(forEachSeries),
        find: createFindFunc(forEach)
    };
}

var stopValue = {};
var notFound = {};
