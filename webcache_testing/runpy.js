let { PythonShell } = require('python-shell');

let options = {
    mode: 'text',
    // pythonPath: 'path/to/python',
    // pythonOptions: ['-u'], // get print results in real-time
    scriptPath: '',
    // args: ['value1', 'value2', 'value3']
}

let pyshell = new PythonShell('fromjs.py', options);

pyshell.send('from js - eat this'); // send python a message via stdin
pyshell.on('message', function (message) {
    console.log(`Javascript: ${message}`);
});
pyshell.end(function(err, code, signal) {
    if (err)
        throw err;
    console.log(`The exit code was ${code}`);
    console.log(`The exit signal was ${signal}`);
    console.log('finished');
    console.log('finished');
});

