const NetworkBandwidthMonitor = require("./index");

const monitor = new NetworkBandwidthMonitor();
monitor.registerCallback((data) => {
    console.log("Data received:", data);
});
monitor.start();

setTimeout(() => {
    monitor.stop();
}, 10000);