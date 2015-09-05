var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var python = require('python').shell;
var fs = require('fs');

app.use(express.static(__dirname));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
var testing = true;
if (testing) {
    http.listen(80, function() {
        console.log('Listening on *:80.');
    });
} else {
    python("import sys;sys.path.append('jacob-neuraltalk');import sentence_maker", function(err, data) {
        if (err) throw err;
        // get_data("../caffe/examples/images", "cat cycle", console.log);
        console.log(data);
        console.log(err);
        http.listen(80, function() {
            console.log('Listening on *:80.');
        });
    });
}

io.on('connection', function(socket) {
    socket.on('picture', function(data) {
        console.log('received image');
        var data = data.replace(/^data:image\/\w+;base64,/, "");
        var buff = new Buffer(data, 'base64');
        var fname = __dirname + '/jacob-neuraltalk/images/snapshot' + socket.id + '.png';
        console.log(fname);
        var fd = fs.openSync(fname, 'w');
        fs.write(fd, buff, 0, buff.length, 0, function(err, written) {console.log(err)});
        // CLOSE SOMETHING HERE?
        if (!testing) {
            python("sentence_maker.get_sentence('images/snapshot" + socket.id + ".png')", function(err, data) {
                if (err) throw err;
                console.log(data);
                console.log(err);
                //data should have the sentence

            });
            fs.unlink(fname, function(err) {});
        }
    });

});
