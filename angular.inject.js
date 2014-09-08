angular.module('angular.inject', [])
    .run(['$rootScope', '$injector', function($rootScope, $injector) {
        var Scope = $rootScope.constructor;
        var ngInjector = angular.extend({}, $injector);

        Scope.prototype.inject = function (registrations, parentResolve) {
            if (this == $rootScope && !parentResolve)
                this.__resolve = inject(registrations, inject.fallback(function (key) {
                    if (ngInjector.has(key))
                        return ngInjector.get(key);
                }));
            else
                this.__resolve = inject(registrations, parentResolve);

            this.$on('$destroy', function (e) { e.currentScope.__resolve.dispose(); });

            return this.__resolve;
        };

        angular.extend($injector, {
            invoke: function (fn, self, locals) {
                var resolve = findResolve(locals);
                return resolve
                    ? resolve.function(dependant(fn), keys(locals), values(locals)).call(self)
                    : ngInjector.invoke.apply(this, arguments);
            },
            instantiate: function (type, locals) {
                var resolve = findResolve(locals);
                return resolve
                    ? resolve(inject.func(dependant(type), keys(locals))).apply(null, values(locals))
                    : ngInjector.instantiate.apply(this, arguments);
            },
            get: function (key) {
                return $rootScope.__resolve
                    ? $rootScope.__resolve(dependant(key))
                    : ngInjector.get.apply(this, arguments);
            },
            has: function (key) {
                return $rootScope.__resolve
                    ? !!$rootScope.__resolve.injected(dependant(key))
                    : ngInjector.has.apply(this, arguments);
            }
        });

        function dependant(fn) {
            return Array.isArray(fn)
                ? inject.dependant(fn.slice(0, -1), fn.slice(-1)[0])
                : fn;
        }

        function findResolve(locals) {
            var scope = values(locals || {}).filter(function (value) {
                return value instanceof Scope;
            })[0];

            while (scope && !scope.__resolve)
                scope = scope.$parent;

            return scope && scope.__resolve
                || $rootScope.__resolve;
        }

        function keys(obj) {
            return Object.keys(obj || {});
        }

        function values(obj) {
            return keys(obj).map(function (key) { return obj[key]; });
        }
    }]);

(function () {
    var innerCtor = inject.ctor;
    inject.ctor = function (dependencies, fn) {
        fn.$inject = dependencies;
        return innerCtor(dependencies, fn);
    };

    var innerDependant = inject.dependant;
    inject.dependant = function (dependencies, fn) {
        fn.$inject = dependencies;
        return innerDependant(dependencies, fn);
    };
})();
