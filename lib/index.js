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
        
        function next() {
            if (index < array.length) {
                var result = iterator(array[index], index)
                    .then(next);
                index++;
                return result;
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
    
    return {
        create: createPromise,
        resolved: resolved,
        rejected: rejected,
        forEachSeries: forEachSeries,
        forEach: forEach
    };
}
