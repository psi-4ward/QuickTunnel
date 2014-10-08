
app.controller('TunnelController', function($scope, Runner) {
  $scope.tunnelTypes = {
    'L': 'local',
    'R': 'remote'
  };

  $scope.addForwarding = function() {
    $scope.Config.Forwardings.push({
      type: 'R',
      bindAddr: '*',
      srcPort: 2222,
      host: 'localhost',
      destPort: 22
    });
  };

  $scope.removeForwarding = function(i) {
    $scope.Config.Forwardings.splice(i, 1);
  };

  $scope.Runner = Runner;

});