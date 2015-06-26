rippleGatewayApp.service('UserService', ['$http', '$location', 'Base64', function($http, $location, Base64) {

  function registerUser(opts, fn) {
    $http({ method: "POST", url: '/v1/register', data: opts })
    .success(function(response, status, headers, config) {
      fn(null, response.user);
    })
    .error(function(data, status, headers, config) {
      fn(data, null);
    });
  }

  function loginUser(opts, fn) {
   $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode(opts.name+':'+opts.password)

    $http({ method: "POST", url: '/v1/users/login', data: opts })
    .success(function(response, status, headers, config) {
      fn(null, response.user);
    })
    .error(function(data, status, headers, config) {
      fn(data, null);
    });
  }

  var user = { 
    name: "",
    password: "",
    id: "",
    isLogged: false,
    isAdmin: false,
    login: function(name, password, fn) {
      loginUser({ name: name, password: password }, fn);
    },
    logout: function(fn) {
      delete $http.defaults.headers.common['Authorization'];
      user.name = "";
      user.password = "";
      user.id = "";
      user.isLogged = false;
      user.isAdmin = false;
      $location.path("/login");
    },
    register: function(opts, fn){
      registerUser({
        name: opts.name,
        password: opts.password,
        ripple_address: opts.ripple_address,
        secret: opts.secret,
        currency: opts.currency,
        amount: opts.amount
      }, fn);
    }
  };
  return user;
}]);

