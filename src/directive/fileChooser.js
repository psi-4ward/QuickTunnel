app.directive('fileChooser', function() {

  return {
    restrict: 'E',
    scope: {
      path: '='
    },
    templateUrl: 'templates/fileChooser.html',
    link: function(scope, el) {
      scope.path = '~/.ssh/id_rsa';

      var fileInput = el.find('input');
      el.find('a').bind('click', fileInput[0].click.bind(fileInput[0]));

      fileInput.bind('change', function(event) {
        var files = event.target.files;
        if (!files) return;
        var file = files[0];
        scope.path = file ? file.path : undefined;
        scope.$apply();
      });
    }
  };
});