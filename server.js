const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

let stateStatus = {};

app.use(express.static('public'));

app.get('/status', (req, res) => {
    res.json(stateStatus);
});

io.on('connection', (socket) => {
    socket.emit('statusUpdate', {
        demVotes: calculateVotes('dem'),
        repVotes: calculateVotes('rep'),
        states: stateStatus
    });

    socket.on('updateStatus', (update) => {
        stateStatus[update.name] = { party: update.party, votes: update.votes };
        io.emit('statusUpdate', {
            demVotes: calculateVotes('dem'),
            repVotes: calculateVotes('rep'),
            states: stateStatus
        });
    });
});

function calculateVotes(party) {
    return Object.values(stateStatus).filter(state => state.party === party).reduce((total, state) => total + state.votes, 0);
}

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
