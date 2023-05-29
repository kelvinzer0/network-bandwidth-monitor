const os = require('os');
const exec = require('child_process').exec;

class NetworkBandwithMonitor {
    constructor(interface_ = os.platform() === 'darwin' ? 'en0' : 'eth0', interval_ = 1000, callback) {
        this.interface = interface_;
        this.interval = interval_;
        this.oldRx = 0;
        this.oldTx = 0;
        this.isStart = true;
    }

    stop() {
        this.isStart = false;
    }

    async start() {
        while (this.isStart) {
            await new Promise(resolve => setTimeout(resolve, this.interval));
            const { rx, tx } = await this.getCurrentSpeed();
            const rxMbps = ((rx - this.oldRx) * 8 / (this.interval / 1000)) / 1000 / 1000;
            const txMbps = ((tx - this.oldTx) * 8 / (this.interval / 1000)) / 1000 / 1000;
            const rxKbps = ((rx - this.oldRx) * 8 / (this.interval / 1000)) / 1000;
            const txKbps = ((tx - this.oldTx) * 8 / (this.interval / 1000)) / 1000;
            const rxbps = ((rx - this.oldRx) * 8 / (this.interval / 1000));
            const txbps = ((tx - this.oldTx) * 8 / (this.interval / 1000));
            const object = { uplink: { bps: `${rxbps.toFixed(2)}`, kbps: `${rxKbps.toFixed(2)}`, mbps: `${rxMbps.toFixed(2)}` }, downlink: { bps: `${txbps.toFixed(2)}`, kbps: `${txKbps.toFixed(2)}`, mbps: `${txMbps.toFixed(2)}` } }
            this.callback(object);
            this.oldRx = rx;
            this.oldTx = tx;
            if (typeof this.callback === 'function') {
                this.callback(object);
            }
        }
    }

    registerCallback(cb) {
        this.callback = cb;
    }

    async getCurrentSpeed() {
        return new Promise((resolve, reject) => {
            let command = '';
            if (os.platform() === 'darwin') {
                command = `netstat -ibI ${this.interface} | grep -E "^[a-z]" | awk '{print $10, $7}' | tail -n 1`;
            } else if (os.platform() === 'win32' || os.platform() === 'win64') {
                command = `netstat /e | findstr "Bytes"`;
            } else {
                command = `cat /sys/class/net/${this.interface}/statistics/rx_bytes && cat /sys/class/net/${this.interface}/statistics/tx_bytes`;
            }
            exec(command, (err, stdout) => {
                if (err) {
                    reject(err);
                } else {
                    if (os.platform() === 'win32' || os.platform() === 'win64') {
                        const output = stdout.trim().replace(/\t|\s{2,}/g, ' ').replace(/Bytes/g, '').trim();
                        const [rx, tx] = output.split(' ').map(n => parseInt(n));
                        resolve({ rx, tx });
                    } else if (os.platform() === 'darwin') {
                        const [rx, tx] = stdout.trim().split(' ').map(n => parseInt(n));
                        resolve({ rx, tx });
                    } else {
                        const [rx, tx] = stdout.trim().split(/\r?\n/).map(n => parseInt(n));
                        resolve({ rx, tx });
                    }
                }
            });
        });
    }
}


module.exports = NetworkBandwithMonitor;