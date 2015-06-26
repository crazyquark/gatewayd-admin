rippleGatewayApp.controller('RegistrationCtrl', [
  '$scope', 'UserService', '$location',
  function($scope, $user, $location) {
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
    $scope.register = function() {
      $user.register($scope.newUser, function(error, user){
        if (error) {
          $scope.registeredUser = null;
          $scope.registrationError = error;
          console.log('error registering user:', error);
        } else {
          console.log('registered a new user:', user);
          $scope.registeredUser = user;
          $scope.registrationError = null;
        }
      });
    };
}]);
