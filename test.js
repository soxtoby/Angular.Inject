angular.module('test', ['angular.inject'])
    .config(['$controllerProvider', function ($controllerProvider) {
        $controllerProvider.allowGlobals();
    }])
    .run(['$rootScope', function ($rootScope) {
        $rootScope.inject([
            inject.value('outer').forKey('key')
        ]);
    }])
    .directive('directive', ['key', function (value) {
        return function (scope, element, attrs) {
            scope.resolved = value == 'outer';
        };
    }])
    .directive('isolatedScope', ['$injector', function($injector) {
        return {
            scope: {
                foo: '='
            },
            template: '<div directive>Isolated scope: {{!__resolve && resolved}}</div>',
            controller: IsolatedScopeController
        };
    }])
    .filter('resolved', ['key', function (value) {
        return function (text) {
            return text == value;
        }
    }]);


var InnerController = inject.ctor([inject.resolve, 'key', '$scope'], function (resolve, value, $scope) {
    if (!(this instanceof InnerController))
        throw new Error('InnerController not called as a constructor');

    var resolve = $scope.inject([
        inject.value('inner').forKey('key')
    ], resolve);

    this.resolved = value == 'outer';
    this.hasResolve = resolve('key') == 'inner';
});

var ArraySpecifiedController = [
    'key', function ArraySpecifiedControllerConstructor(value) {
        if (!(this instanceof ArraySpecifiedControllerConstructor))
            throw new Error('ArraySpecifiedController not called as a constructor');

        this.resolved = value == 'outer';
    }
];

var IsolatedScopeController =
    inject.ctor(['key', '$scope', '$element', '$attrs'],
    function (value, $scope, $element, $attrs) {
        this.$scope = $scope;
    });

IsolatedScopeController.prototype = {
    get foo() { return this.$scope.foo; },
    set foo(value) { this.$scope.foo = value }
};