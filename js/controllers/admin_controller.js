rippleGatewayApp.controller('AdminCtrl', [
  '$scope', '$http', '$state', '$window', 'UserService', 'ApiService',
  function($scope, $http, $state, $window, $user, $api){

  if (!$user.isAdmin) {
    $state.go('login');
  }

  // todo: remove this?
  $scope.path = function() {
    $state.path();
  };

  $scope.externalTransactions = [];
  $scope.users = [];
  $scope.withdrawals = [];
  $scope.currencies = [];
  $scope.clearedTransactions = [];
  $scope.accountBalance = [];
  $scope.liabilities = [];
  $scope.deposit = {};

  $scope.newUser = {
    name: '',
    password: '',
    ripple_address: '',
    secret: '',
    currency: '',
    amount: '' 
  };

  $scope.registeredUser = null;
  $scope.registrationError = null;
  $scope.registerUser = function() {
    $user.register($scope.newUser, function(error, user){
      if (error) {
        $scope.registeredUser = null;
        $scope.registrationError = error;
        console.log('error registering user:', error);
      } else {
        console.log('registered a new user:', user);
        $scope.registeredUser = user;
        $scope.registrationError = null;
        reloadUsers();
      }
    });
  };

  //UI states
  $scope.isSubmitting = false;
  $scope.isLoading = true;

  $scope.orderProperty = 'createdAt';
  $scope.reverse = true;

  $api.getBalance(function(err, resp){
    if (!err && resp.success) {
      $scope.accountBalance = resp.balances;
    }
  });

  $api.getLiabilities(function(err, resp){
    if (!err && resp.success) {
      $scope.liabilities = resp.balances;
      $scope.isLoading = false;
    }
  });

  $api.getCurrencies(function(error, response){
    if (error) {
      console.log('getCurrencies error', error);
    } else if (response) {
      angular.forEach(response.CURRENCIES, function(key, value){
        $scope.currencies.push(value);
      });
    }
  });

  function reloadUsers() {
    $api.getUsers(function(error, response){
      if (error) {
        console.log('api.getUsers error', error);
      } else if (response) {
        $scope.users = response.users;
      }
    });
  }

  $api.getUsers(function(err, resp) {
    $scope.users = resp.users;

    /*
    angular.forEach(resp.users, function(key, value){
      $api.getRippleAddress(key.id, function(err, resp) {
        if(resp.ripple_address && (resp.ripple_address.id == key.id)){
          key.independent_address = resp.ripple_address.address;
        }
      });
    })
    */
  });

  $api.getWithdrawals(function(err, resp) {
    $scope.withdrawals = resp.withdrawals;
    $scope.isLoading = false;
  });

  function getClearedTransactions(fn) {
    var outstandingCalls = 2,
        transactions = [];

    function handleResponse(resp) {
      resp.external_transactions.forEach(function(transaction) {
        transactions.push(transaction);
      });

      outstandingCalls -= 1;

      if (outstandingCalls === 0) {
        fn(null, transactions);
      }
    }

    $api.queryExternalTransactions({ status: 'processed' }, function(err, resp) {
      if (err) {
        fn(err, null);
        return;
      }

      handleResponse(resp);
    });

    $api.queryExternalTransactions({ status: 'cleared' }, function(err, resp) {
      if (err) {
        fn(err, null);
        return;
      }

      handleResponse(resp, fn);
    });
  }

  $scope.clearWithdrawal = function(id) {
    $api.clearWithdrawal(id, function(err){
      if(!err){
        $api.getWithdrawals(function(err, resp){
          $scope.withdrawals = resp.withdrawals;
          $scope.isLoading = false;
        });
      }
    });
  };

  $scope.submitDepositForm = function(valid){
      $scope.isSubmitting = true;
      delete $scope.deposit.amount2;

      console.log($scope.deposit);
      $api.makeDeposit($scope.deposit, function(data){
        getClearedTransactions(function(err, transactions){

          if (err) { console.log('error', err); return; }

          $scope.externalTransactions = transactions;
          $scope.isSubmitting = false;
          $scope.isLoading = false;

          //Clear form
          angular.forEach($scope.deposit, function(key, value){
            $scope.deposit[value] = null;
          });
        });
      });
  };

  getClearedTransactions(function(error, transactions){
    if (error) {
      console.log('getClearedTransactions error', error);
    } else {
      $scope.externalTransactions = transactions;
      $scope.isSubmitting = false;
      $scope.isLoading = false;
    }
  });

  $window.api = $api;

}]);

