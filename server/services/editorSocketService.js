var redisClient = require("../modules/redisClient");
const TIMEOUT_IN_SECONDS = 3600;

module.exports = function(io) {
    // collaboration sesssions
    var collaborations = {};
    
    // map from socket id to problem id
    var socketIdToProblemId = {};
    
    io.on('connection', (socket) => {
        var problemId = socket.handshake.query['problemId'];
        socketIdToProblemId[socket.id] = problemId;
        
        var sessionPath = '/temp_sessions/'
        
        if (problemId in collaborations) {
            collaborations[problemId]['participants'].push(socket.id);
        } else {
            redisClient.get(sessionPath + problemId, (data) => {
                if (data) {
                    console.log('session terminated previously, pulling back from redis');
                    
                    collaborations[problemId] = {
                        'participants': [],
                        'cacheInstructions': JSON.parse(data)
                    };
                } else {
                    console.log('creating new session');
                    collaborations[problemId] = {
                        'participants': [],
                        'cacheInstructions': []
                    };
                }
                
                collaborations[problemId]['participants'].push(socket.id);
            });
        }

        socket.on('change', delta => {
            console.log("change received: " + socketIdToProblemId[socket.id] + " " + delta);
            let problemId = socketIdToProblemId[socket.id];
            
            if (problemId in collaborations) {
                // save instrutions to collaboration
                collaborations[problemId]['cacheInstructions'].push(
                    ['change', delta, Date.now()]);
                    
                let participants = collaborations[problemId]['participants'];
                
                for (let i = 0; i < participants.length; i++) {
                    if (socket.id != participants[i]) {
                        io.to(participants[i]).emit('change', delta);
                    }
                }
            } else {
                console.log('warning: could not tie socket id to any collaborations');
            }
        });
        
        socket.on('restoreBuffer', () => {
            let problemId = socketIdToProblemId[socket.id];
            console.log('restore buffer for problem: ' + problemId + ', socket id: ' + socket.id);
            
            if (problemId in collaborations) {
                let instrutions = collaborations[problemId]['cacheInstructions'];
                
                for (let i = 0; i < instrutions.length; i++) {
                    socket.emit(instrutions[i][0], instrutions[i][1]);
                }
            } else {
                console.log('no collaboration found for this socket');
            }
        });
        
        socket.on('disconnect', () => {
            let problemId = socketIdToProblemId[socket.id];
            console.log('disconnect problem: ' + problemId + ', socket id: ' + socket.id);
            
            let foundAndRemoved = false;
            
            if (problemId in collaborations) {
                let participants = collaborations[problemId]['participants'];
                
                let index = participants.indexOf(socket.id);
                
                if (index >= 0) {
                    participants.splice(index, 1);
                    foundAndRemoved = true;
                    
                    if (participants.length === 0) {
                        console.log('last participant is leaving, commit to redis');
                        
                        let key = sessionPath + problemId;
                        let value = JSON.stringify(collaborations[problemId]['cacheInstructions']);
                        
                        redisClient.set(key, value, redisClient.redisPrint);
                        redisClient.expire(key, TIMEOUT_IN_SECONDS);
                        
                        delete collaborations[problemId];
                    }
                }
            }
            
            if (!foundAndRemoved) {
                console.log('warning: could not find socket id in collaboration');
            }
        });
    });
}