rippleGatewayApp.controller('ExternalTransactionsCtrl', [
  '$scope', 'UserService', 'ApiService', '$window', '$state', '$timeout',
    'ExternalTransactionsModel',
  function($scope, $user, $api, $window, $state, $timeout, Model) {
    "use strict";

    if (!$user.isAdmin || !$user.isLogged) {
      $state.go('login');
      return false;
    }

    $scope.transactions = [];

    //read
    $scope.transactions = Model.get();

    //create
    $scope.create = function() {
      $scope.crudType = "create";
      $scope.transaction = {
        external_account_id: 1 // delete this when fully deprecated
      };
    };

    $scope.submitCreate = function() {
      Model.create($scope.transaction).then(function() {
        $state.go('database.external_transactions');
      });
    };

    //update
    $scope.update = function(index) {
      $scope.currentIndex = index;
      $scope.crudType = "update";
      $scope.transaction = $scope.transactions[index].clone();
    };

    $scope.submitUpdate = function() {
      Model.update($scope.transaction).then(function() {
        $state.go('database.external_transactions');
        $scope.transactions[$scope.currentIndex] = $scope.transaction;
      });
    };

    //delete
    $scope.remove = function(index) {
      var transaction = $scope.transactions[index],
          confirmed = $window.confirm('are you sure?');

      if (confirmed) {
        Model.delete(transaction);
      }
    };
}]);
