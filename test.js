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
    .directive('isolatedScope', function() {
        return {
            scope: { },
            template: '<div directive>Isolated scope: {{!__resolve && resolved}}</div>'
        }
    })
    .filter('resolved', ['key', function (value) {
        return function (text) {
            return text == value;
        }
    }]);


var InnerController = inject.ctor([inject.resolve, 'key', '$scope'], function (resolve, value, $scope) {
    var resolve = $scope.inject([
        inject.value('inner').forKey('key')
    ], resolve);

    this.resolved = value == 'outer';
    this.hasResolve = resolve('key') == 'inner';
});