var interval;
function tick()
{
    postMessage({'cmd': 'tick'});
}
function stop()
{
    cancelInterval();
}
function _setInterval()
{
    interval = setInterval(tick, String(self.delayMs));
}
function reset()
{
    if (interval)
        cancelInterval();
    _setInterval();
}
function cancelInterval()
{
    if (interval)
    {
        clearInterval(interval);
    }
}
function start()
{
    _setInterval();
}
self.onmessage = function (e) {
    switch (e.data.cmd) {
        case 'reset':
            reset();
            break;
        case 'stop':
            stop();
            break;
        case 'start':
            start();
            break;
        case 'interval':
            self.delayMs = e.data.delayMs;
            break;
    }
};