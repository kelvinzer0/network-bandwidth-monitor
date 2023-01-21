# Network Bandwidth Monitor

A Node.js module to monitor network bandwidth usage. It works on Windows, MacOS, and Linux.

## Installation

```bash
npm install node-network-bandwidth-monitor
```

## Usage

```javascript
const NetworkBandwidthMonitor = require("node-network-bandwidth-monitor");

const monitor = new NetworkBandwidthMonitor();
monitor.registerCallback((data) => {
  console.log("Data received:", data);
});
monitor.start();
```

The data object will contain the current network bandwidth usage in bytes per second, kilobytes per second and megabytes per second for both uplink and downlink.

You can also pass in an optional network interface and update interval to the constructor like so:

```javascript
const monitor = new NetworkBandwidthMonitor("eth0", 2000);
```

To stop the monitoring, you can call the `stop()` function on the monitor object.

## Example Output

```javascript
Data received: {
  uplink: {
    bps: '34.00',
    kbps: '0.03',
    mbps: '0.00'
  },
  downlink: {
    bps: '56.00',
    kbps: '0.05',
    mbps: '0.00'
  }
}
```

## License

This package is licensed under the MIT license.

## Contribution

Feel free to submit pull requests or issues.
