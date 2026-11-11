var app = angular.module("calcApp", []);

app.controller("calcCtrl", function ($scope) {
  $scope.a = 48;
  $scope.b = 6;
  $scope.op = "*";

  $scope.result = function () {
    var x = Number($scope.a);
    var y = Number($scope.b);
    switch ($scope.op) {
      case "+":
        return x + y;
      case "-":
        return x - y;
      case "*":
        return x * y;
      case "/":
        return y === 0 ? "Cannot divide by zero" : (x / y).toFixed(2);
      case "%":
        return y === 0 ? "Cannot divide by zero" : x % y;
      default:
        return "";
    }
  };
});
