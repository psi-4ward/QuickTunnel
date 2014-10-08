app.directive('fileChooser', function() {

  var macTemplate = '<input type="text" value="{{path}}" class="form-control" placeholder="Path to file">';
  var normalTemplate = '<a class="btn btn-default">{{path || "choose a file"}}</a><input type="file">';
  var isMac = process.platform === 'darwin';
  
  return {
    restrict: 'E',
    scope: {
      path: '='
    },
    template: isMac ? macTemplate : normalTemplate,
    link: function(scope, el) {
      if (isMac) {
        scope.path = '~/.ssh/id_rsa';
        return;
      }

      var fileInput = el.find('input');
      el.find('a').bind('click', fileInput[0].click.bind(fileInput[0]));

      fileInput.bind('change', function(event) {
        var files = event.target.files;
        var file = files[0];
        scope.path = file ? file.path : undefined;
        scope.$apply();
      });
    }
  };
});