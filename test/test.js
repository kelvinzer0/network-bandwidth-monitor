const assert = require('assert');
const NetworkBandwithMonitor = require('../index');

describe('NetworkBandwithMonitor', () => {
    it('should return the current network bandwidth data', (done) => {
        const monitor = new NetworkBandwithMonitor();
        monitor.registerCallback(data => {
            assert.ok(data);
            assert.ok(data.uplink);
            assert.ok(data.downlink);
            assert.ok(data.uplink.bps);
            assert.ok(data.uplink.kbps);
            assert.ok(data.uplink.mbps);
            assert.ok(data.downlink.bps);
            assert.ok(data.downlink.kbps);
            assert.ok(data.downlink.mbps);
            monitor.stop();

        });
        monitor.start();
        done();
    });

});