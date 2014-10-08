// remember, this and all src/**/*.js gets wrapped in a closure

var _ = require('lodash');
var nwGui = require('nw.gui');
var app = angular.module('app', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/tunnel');

  $stateProvider.state({
    name: 'tunnel',
    url: '/tunnel',
    controller: 'TunnelController',
    templateUrl: 'templates/tunnel.html'
  });
  $stateProvider.state({
    name: 'console',
    url: '/console',
    templateUrl: 'templates/console.html'
  });
  $stateProvider.state({
    name: 'config',
    url: '/config',
    templateUrl: 'templates/config.html'
  });
  $stateProvider.state({
    name: 'about',
    url: '/about',
    templateUrl: 'templates/about.html'
  });

});

app.run(function($rootScope, Cfg, Runner) {
  $rootScope.Config = Cfg.config;
  $rootScope.Runner = Runner;
  $rootScope.$watch('Config', Cfg.save, true);

  function exit() {
    if(Runner.running) Runner.stop();
    nwGui.App.quit();
  }

  nwGui.Window.get().on('close', exit);

  $rootScope.exit = exit;
});