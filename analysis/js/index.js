// Reference: https://plainenglish.io/blog/how-to-run-python-script-using-node-js-6b351169e916

const {spawn} = require('child_process');
 
var dataToSend;

// spawn new child process to call the python script
const python = spawn('python', ['test.py', JSON.stringify(
    {
        "a": 1
    }
) ]);

// collect data from script
python.stdout.on('data', function (data) {
    console.log('Pipe data from python script ...');
    dataToSend = data.toString();
});

python.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    
    // send data to terminal
    console.log(dataToSend)

});