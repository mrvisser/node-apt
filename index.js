
var _ = require('underscore');
var events = require('events');
var exec = require('child_process').exec;
var util = require('util');

var _path = {};

/**
 * Get or set the path for a binary alias
 */
var path = module.exports.path = function(alias, path) {
    if (path) {
        _path[alias] = path;
    }
    return _path[alias] || alias;
};

/**
 * Show the currently installed version of the module using dpkg -s
 */
var show = module.exports.show = function(name, callback) {
    exec(util.format('%s -s %s', path('dpkg'), name), function(err, stdout, stderr) {
        if (err) {
            return callback(err);
        }

        return callback(null, _parseOutput(stdout));
    });
};

/**
 * Update the apt cache using apt-get update
 */
var update = module.exports.update = function(callback) {
    var emitter = new events.EventEmitter();
    var child = exec(util.format('%s update', path('apt-get')), function(err, stdout, stderr) {
        if (err) {
            return callback(err);
        }

        return callback();
    });

    child.stdout.on('data', function(data) {
        emitter.emit('stdout', data);
    });

    child.stderr.on('data', function(data) {
        emitter.emit('stderr', data);
    });

    return emitter;
};

/**
 * Install the module with the given name, optionally with the given version
 *
 * @param   {String}    name                The name of the module to install (e.g., redis-server)
 * @param   {String}    [version]           The version of the module to install
 * @param   {Object}    [options]           Invokation arguments
 * @param   {Boolean}   [options.confnew]   If `true` and a module is being upgraded, existing configurations will be overwritten. Default: `false`
 * @param   {Function}  [callback]          Invoked when installation is complete
 * @param   {Error}     [callback.err]      An error that occurred, if any
 * @param   {Object}    [callback.package]  The package definition (from `show`) of the module that was installed
 */
var install = module.exports.install = function(/* name, [version,] [options,] callback */) {
    var args = Array.prototype.slice.call(arguments);
    var name = args.shift();
    var version = (_.isString(args[0])) ? args.shift() : null;
    var options = (!_.isFunction(args[0])) ? args.shift() : null;
    var callback = args.shift();

    if (version) {
        name = util.format('%s=%s', name, version);
    }

    options = options || {};
    var forceConf = (options.confnew) ? 'new' : 'old';
    var emitter = new events.EventEmitter();
    var child = exec(util.format('%s install -y -o Dpkg::Options::="--force-conf%s" %s', path('apt-get'), forceConf, name), function(err, stdout, stderr) {
        if (err) {
            return callback(err);
        }

        return show(name, callback);
    });

    child.stdout.on('data', function(data) {
        emitter.emit('stdout', data);
    });

    child.stderr.on('data', function(data) {
        emitter.emit('stderr', data);
    });

    return emitter;
};

/**
 * Uninstall the package with the given name
 */
var uninstall = module.exports.uninstall = function(name, callback) {
    var emitter = new events.EventEmitter();
    var child = exec(util.format('%s remove -y %s', path('apt-get'), name), callback);

    child.stdout.on('data', function(data) {
        emitter.emit('stdout', data);
    });

    child.stderr.on('data', function(data) {
        emitter.emit('stderr', data);
    });

    return emitter;
};

var _parseOutput = function(output) {
    output = output || '';
    if (!output.trim()) {
        return {};
    }

    var parsed = {};
    var currKey = null;
    var currValue = '';
    output = output.split('\n');
    _.each(output, function(line) {
        if (line[0] !== ' ') {
            // This is a new key
            if (currKey) {
                parsed[currKey] = currValue;
            }

            // Start the curr* variables for the next key
            line = line.split(':');
            currKey = line.shift();
            currValue = line.join(':').trim();
        } else if (line === ' .') {
            // The literal " ." indicates a new paragraph
            currValue += '\n\n';
        } else {
            currValue += line.trim();
        }
    });

    // Apply the last key
    if (currKey) {
        parsed[currKey] = currValue;
    }

    return parsed;
};
