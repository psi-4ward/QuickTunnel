var fs = require('fs');
var yaml = require('js-yaml');

var path;
if(process.platform === 'linux') path = process.env.PWD;
else path = require('path').dirname(process.execPath);

var configfile = path + '/quicktunnel.yaml';

var cfg = {
  Host: {
    port: 22
  },
  Forwardings: []
};

// Load config
try {
  cfg = yaml.safeLoad(fs.readFileSync(configfile, 'utf-8'));
  cfg.Host.port = +cfg.Host.port;
  cfg.Forwardings = cfg.Forwardings || [];

  angular.forEach(cfg.Forwardings, function(val) {
    val.destPort = +val.destPort;
    val.srcPort = +val.srcPort;
  });
} catch(e) {}

app.factory('Cfg', function() {
  var o = {
    config: cfg,
    basedir: path,
    isWin: process.platform.substr(0,3) === 'win',
    save: _.debounce(function() {
      var s = yaml.safeDump(o.config);
      fs.writeFileSync(configfile, s);
    }, 200)
  };
  return o;
});