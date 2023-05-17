const os = require('os');
const exec = require('child_process').exec;
const { convertToMbps, convertToBps, convertToKbps } = require("./UnitsConversion");

class NetworkBandwithMonitor {
    constructor(interval_ = 1000, callback) {
        this.interface = os.platform() === 'darwin' ? 'en0' : 'eth0';
        this.interval = interval_;
        this.oldRx = 0;
        this.oldTx = 0;
        this.isStart = true;
        this.callback = callback;
        this.hostOS = os.platform();
    }

    stop() {
        this.isStart = false;
    }

    /**
     * Start retriving the current network Transfer(tx) and Receive speed(rx).
     * @param {callback function} callback will be executed for every iteration of "this.interval".
     */
    async start(callback) {
        if (callback !== null) {
            this.callback = callback;
        }

        while (this.isStart) {
            await new Promise(resolve => { setTimeout(resolve, this.interval) });

            const { rx: currentRx, tx: currentTx } = await this.getCurrentSpeed();
            const { rxKbps, rxMbps, rxbps, txKbps, txMbps, txbps } = this._generateSpeedRates(currentRx, currentTx);

            const speedRatesObject = { uplink: { bps: `${rxbps.toFixed(2)}`, kbps: `${rxKbps.toFixed(2)}`, mbps: `${rxMbps.toFixed(2)}` }, downlink: { bps: `${txbps.toFixed(2)}`, kbps: `${txKbps.toFixed(2)}`, mbps: `${txMbps.toFixed(2)}` } }

            this.oldRx = currentRx;
            this.oldTx = currentTx;
            if (typeof this.callback === 'function') {
                this.callback(speedRatesObject);
            }
        }
    }

    /**
     * Generate different units of network speed (Mbps, Kbps, Bps) 
     * @param {Decimal} currentRx 
     * @param {Decimal} currentTx 
     * @returns Mbps, Kbps and Bps units of current Receive(rx) and Transfer(tx)
     */
    _generateSpeedRates(currentRx, currentTx) {
        const newRx = currentRx - this.oldRx;
        const newTx = currentTx - this.oldTx;

        let rxMbps = convertToMbps(newRx, this.interval);
        const txMbps = convertToMbps(newTx, this.interval);

        let rxKbps = convertToKbps(newRx, this.interval);
        const txKbps = convertToKbps(newTx, this.interval);

        let rxbps = convertToBps(newRx, this.interval);
        const txbps = convertToBps(newTx, this.interval);

        return {
            rxMbps,
            txMbps,
            rxKbps,
            txKbps,
            rxbps,
            txbps
        }
    }

    /**
     * Register callback function to the class which will be called for every "this.interval" set by the user 
     * @param {function} cb 
     */
    registerCallback(cb) {
        this.callback = cb;
    }

    /**
     * This method checks the host OS and execute a corresponding command to retrieve the status of the network interface.
     * @returns Receive (rx) and Transfer (tx) speed of the network interface
     */
    async getCurrentSpeed() {
        return new Promise((resolve, reject) => {
            let command = '';
            if (this.hostOS === 'darwin') {
                command = `netstat -ibI ${this.interface} | grep -E "^[a-z]" | awk '{print $10, $7}' | tail -n 1`;
            } else if (this.hostOS === 'win32' || this.hostOS === 'win64') {
                command = `netstat /e | findstr "Bytes"`;
            } else {
                command = `cat /sys/class/net/${this.interface}/statistics/rx_bytes && cat /sys/class/net/${this.interface}/statistics/tx_bytes`;
            }
            /**
             * Retrieve the result from the "stdout" and 
             * format the result to extract Receive(rx) and Tansfer(tx) data
             */
            exec(command, (err, stdout) => {
                if (err) {
                    return reject(err);
                }

                if (this.hostOS === 'win32' || this.hostOS === 'win64') {
                    const output = stdout.trim().replace(/\t|\s{2,}/g, ' ').replace(/Bytes/g, '').trim();
                    const [rx, tx] = output.split(' ').map(n => parseInt(n));
                    resolve({ rx, tx });
                } else if (this.hostOS === 'darwin') {
                    const [rx, tx] = stdout.trim().split(' ').map(n => parseInt(n));
                    resolve({ rx, tx });
                } else {
                    const [rx, tx] = stdout.trim().split(/\r?\n/).map(n => parseInt(n));
                    resolve({ rx, tx });
                }

            });

        });
    }
}


module.exports = NetworkBandwithMonitor;