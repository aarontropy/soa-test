var jackrabbit = require('jackrabbit');


/**
 * CLuster is used to start a number of instances
 * and to restart a process if it ends
 */
var cluster = require('cluster');
if (cluster.isMaster) {
    var i = 0;
    for (i; i< 1; i++){
        cluster.fork();
    }
    
    //if the worker dies, restart it.
    cluster.on('exit', reviveWorker);

    function reviveWorker(worker) {
        console.log('Worker ' + worker.id + ' died..');
        cluster.fork();
    }
} else{
    start();
}

function start() {
    var CLOUDAMQP_URL = 'amqp://yqenbgog:578Nxatk_miGskONJlXXNG5GaU8kbmDc@lemur.cloudamqp.com/yqenbgog';

    var broker = jackrabbit(CLOUDAMQP_URL, 1);
    broker.once('connected', createQueue);
    broker.once('disconnected', kill);
    process.once('uncaughtException', kill);


    function createQueue() {
        broker.create('get.foo', serve);
    }

    function kill() {
        console.log('Foo Service is dying');
        process.exit();
    }

    /**
     * SERVICE GOES HERE
     */
    function serve() {
        console.log("Foo Service now serving")
        broker.handle('get.foo', function getFoo(msg, reply) {
            reply('Hello? Yes, this is Foo.');
        });
    }


}
