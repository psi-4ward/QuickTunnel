var spawn = require('child_process').spawn;

app.factory('Runner', function(Cfg, $rootScope) {

  function buildArgs() {
    var args = [];

    if(Cfg.isWin) args.push('-P');
    else args.push('-p');
    args.push(Cfg.config.Host.port);

    args.push(Cfg.config.Host.user + '@' + Cfg.config.Host.host);

    args.push('-i');
    args.push(Cfg.config.Host.privateKeyFile);

    args.push('-N'); // Do not execute a remote command.

    if(!Cfg.isWin) {
      args.push('-o');
      args.push('ServerAliveInterval=5');
    }

    args.push('-v');

    console.log(Cfg.config.Forwardings);
    Cfg.config.Forwardings.forEach(function(f) {
      args.push('-' + f.type);
      args.push(
        (f.bindAddr || 'localhost') + ':' + f.srcPort + ':' + f.host + ':' + f.destPort
      );
    });

    return args;
  }

  var proc;
  var r = {
    running: false,
    console: '',
    error: '',

    start: function() {
      r.running = true;
      r.error = '';

      var cmd = 'ssh';
      if(Cfg.isWin) cmd = 'plink.cmd';

      var args = buildArgs();
      r.console = '$ ' +cmd + ' ' + args.join(' ') + '\n';
      proc = spawn(cmd, args, {cwd: Cfg.basedir});

      var accepted = false;
      function getData(data) {
        r.console += data.toString();
        if(!accepted && Cfg.isWin && r.console.match(/\(y\/n\)/)) {
          setTimeout(function() {
            proc.stdin.write("n");
            proc.stdin.write("\r");
            proc.stdin.write("\n");
            proc.stdin.write("\x03");
            r.console += "n\r\n";
          },1000);
          accepted = true;
        }
        $rootScope.$apply();
      }
      proc.stdout.on('data', getData);
      proc.stderr.on('data', getData);

      proc.on('error', function(e) {
        r.running = false;
        r.error = e.message;
        $rootScope.$apply();
      });

      proc.on('close', function(code) {
        r.running = false;
        if(code > 0) r.error = 'Error occoured, see console for more details';
        $rootScope.$apply();
      });
    },

    stop: function() {
      proc.kill();
      r.running = false;
    }
  };

  return r;
});
