const NetworkBandwidthMonitor = require("./index");

const monitor = new NetworkBandwidthMonitor();

// monitor.registerCallback((data) => {
//     console.log("Data received:", data);
// })

monitor.start((data) => {
    console.log("Data received:", data);
});

setTimeout(() => {
    monitor.stop();
}, 5000);