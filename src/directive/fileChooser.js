app.directive('fileChooser', function() {
  return {
    restrict: 'E',
    scope: {
      path: '='
    },
    template: '<a class="btn btn-default">{{path || "choose a file"}}</a><input type="file">',
    link: function(scope, el) {
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