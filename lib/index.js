exports.promise = function() {
    return createUtilities(require("promise"));
};

exports.q = function() {
    var q = require("q");
    
    function createPromise(func) {
        var deferred = q.defer();
        func(
            deferred.resolve.bind(deferred),
            deferred.reject.bind(deferred)
        );
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
    
    return {
        create: createPromise,
        resolved: resolved,
        rejected: rejected,
        forEachSeries: forEachSeries
    };
}