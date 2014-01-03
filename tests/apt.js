
var assert = require('assert');
var apt = require('../index');

describe('Apt', function() {

    describe('Main', function() {

        beforeEach(function(callback) {
            this.timeout(30000);
            apt.uninstall('redis-server', function(err) {
                // Just make sure the package is gone
                return callback();
            });
        });

        it('install, uninstall and show works as expected', function(callback) {
            this.timeout(30000);

            // Verify update does not fail
            apt.update(function(err) {
                assert.ok(!err);

                // Verify it installs properly
                apt.install('redis-server', function(err, pkg) {
                    assert.ok(!err);
                    assert.strictEqual(pkg.Package, 'redis-server');
                    assert.strictEqual(pkg.Status, 'install ok installed');

                    // Verify we can show it and it reports being installed
                    apt.show('redis-server', function(err, pkg) {
                        assert.ok(!err);
                        assert.strictEqual(pkg.Package, 'redis-server');
                        assert.strictEqual(pkg.Status, 'install ok installed');

                        // Verify we can try and install again without an error
                        apt.install('redis-server', function(err, pkg) {
                            assert.ok(!err);
                            assert.strictEqual(pkg.Package, 'redis-server');
                            assert.strictEqual(pkg.Status, 'install ok installed');

                            // Verify we can uninstall the package
                            apt.uninstall('redis-server', function(err) {
                                assert.ok(!err);

                                // Verify the package is uninstalled
                                apt.show('redis-server', function(err, pkg) {
                                    assert.ok(!err);
                                    assert.strictEqual(pkg.Package, 'redis-server');
                                    assert.strictEqual(pkg.Status, 'deinstall ok config-files');

                                    // Verify uninstalling a package that is not installed does not error
                                    apt.uninstall('redis-server', function(err) {
                                        assert.ok(!err);
                                        return callback();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    describe('Update', function() {

        it('emits data to stdout stream', function(callback) {
            this.timeout(30000);
            var stdout = '';
            var stderr = '';

            apt.update(function(err) {
                assert.ok(!err);
                assert.notEqual(stdout.indexOf('Reading package lists...'), -1);
                assert.strictEqual(stderr, '');
                return callback();
            }).on('stdout', function(data) {
                stdout += data;
            }).on('stderr', function(data) {
                stderr += data;
            });
        });
    });

    describe('Install', function() {

        beforeEach(function(callback) {
            this.timeout(30000);
            apt.uninstall('redis-server', function() {
                return callback();
            });
        });

        it('errors when installing a package that does not exist', function(callback) {
            apt.install('node-apt-does-not-exist', function(err, pkg) {
                assert.ok(err);
                assert.ok(err.message);
                assert.notEqual(err.message.indexOf('Unable to locate package node-apt-does-not-exist'), -1);
                assert.ok(!pkg);
                return callback();
            });
        });

        it('emits data to the stdout and stderr streams', function(callback) {
            this.timeout(30000);
            var stdout = '';
            var stderr = '';
            apt.install('redis-server', function(err) {
                assert.ok(!err);
                assert.notEqual(stdout.indexOf('Setting up redis-server'), -1);

                stdout = '';
                stderr = '';

                apt.install('node-apt-does-not-exist', function(err) {
                    assert.ok(err);
                    assert.strictEqual(stderr, 'E: Unable to locate package node-apt-does-not-exist\n');

                    stdout = '';
                    stderr = '';

                    return callback();
                }).on('stdout', function(data) {
                    stdout += data;
                }).on('stderr', function(data) {
                    stderr += data;
                });
            }).on('stdout', function(data) {
                stdout += data;
            }).on('stderr', function(data) {
                stderr += data;
            });
        });
    });

    describe('Show', function() {
        it('errors when showing a module that does not exist', function(callback) {
            apt.show('node-apt-does-not-exist', function(err, pkg) {
                assert.ok(err);
                assert.ok(err.message);
                assert.notEqual(err.message.indexOf('Package `node-apt-does-not-exist\' is not installed and no info is available'), -1);
                assert.ok(!pkg);
                return callback();
            });
        });
    });

    describe('Uninstall', function() {

        beforeEach(function(callback) {
            this.timeout(30000);
            apt.uninstall('redis-server', function() {
                return callback();
            });
        });

        it('errors when uninstalling a package that does not exist', function(callback) {
            apt.uninstall('node-apt-does-not-exist', function(err) {
                assert.ok(err);
                assert.ok(err.message);
                assert.notEqual(err.message.indexOf('Unable to locate package node-apt-does-not-exist'), -1, err.message);
                return callback();
            });
        });

        it('emits data to the stdout and stderr streams', function(callback) {
            this.timeout(30000);
            var stdout = '';
            var stderr = '';
            apt.uninstall('redis-server', function(err) {
                assert.ok(!err);
                assert.notEqual(stdout.indexOf('Package redis-server is not installed, so not removed'), -1);

                stdout = '';
                stderr = '';

                apt.uninstall('node-apt-does-not-exist', function(err) {
                    assert.ok(err);
                    assert.strictEqual(stderr, 'E: Unable to locate package node-apt-does-not-exist\n');

                    stdout = '';
                    stderr = '';

                    return callback();
                }).on('stdout', function(data) {
                    stdout += data;
                }).on('stderr', function(data) {
                    stderr += data;
                });
            }).on('stdout', function(data) {
                stdout += data;
            }).on('stderr', function(data) {
                stderr += data;
            });
        });
    });

});




