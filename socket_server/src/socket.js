const Utility = require("./Utility");
const socket = require("socket.io");
const { serverURL } = require("../config");
const axios = require("axios");
let subscribedUser = [];
let updateLocation = [];
let socketSubscribedUser = [];
let io = void 0;
let method = "post",
  url = `${serverURL}/v1/auth/updateDriverLocation`,
  headers = {
    "content-type": "application/json",
    Accept: "application/json"
  };
function checkSignalTime(prevTime, presentTime, gpsSocketData) {
  // let time1=deviceTime[0][deviceId].time;
  let diff = (presentTime.getTime() - prevTime.getTime()) / 1000;
  // console.log("time",time.getTime(),"stored time",time1.getTime())
  console.log("time corresponding to device id", Math.floor(diff));
  if (gpsSocketData) {
    if (Math.floor(diff) >= 5) {
      return true;
    }
  } else {
    if (Math.floor(diff) >= 10) {
      return true;
    }
  }
  return false;
}
const configure = function(server, app) {
  io = socket(server);
  io.on("connection", socket => {
    console.log(`connection created ::::${socket.id}`);

    // console.log("socket.id",socket.id);
    socket.emit("subscription_id", socket.id);
    socket.on("subscribe", groups => {
      console.log("user subscribed", groups);
      joinGroup(socket.id, groups);
    });
    socket.on("unsubscribe", groups => {
      leaveGroup(socket.id, groups);
    });
    socket.on("gps_Signal", data => {
      let index = subscribedUser.find(item => {
        return item[data.deviceId];
      });
      console.log("index>>>>>>>>>>>>>", index);
      if (index === undefined) {
        let index = updateLocation.find(item => {
          return item[data.deviceId];
        });
        let options = { method, url, data, headers };
        if (index === undefined) {
          let locationData = { [data.deviceId]: { time: new Date() } };
          updateLocation.push(locationData);
          axios({ ...options })
            .then(response => {
              console.log("Location Updated", response);
            })
            .catch(err => {
              console.log("error caused", err);
            });
          console.log("new data", updateLocation);
        } else {
          if (checkSignalTime(index[data.deviceId].time, new Date(), false)) {
            updateLocation[0][data.deviceId].time = new Date();
            axios({ ...options })
              .then(response => {
                console.log("Location Updated", response);
              })
              .catch(err => {
                console.log("error caused", err);
              });
            console.log("data exist time longer than 10sec");
          }
        }
        console.log("called");
      } else {
        let index = socketSubscribedUser.find(item => {
          return item[data.deviceId];
        });
        if (index === undefined) {
          let socketData = { [data.deviceId]: { time: new Date() } };
          socketSubscribedUser.push(socketData);
          emitGroupUpdates(data.deviceId, {
            data: data,
            filter: "Gps_Device_Data"
          });
        } else {
          if (checkSignalTime(index[data.deviceId].time, new Date(), true)) {
            emitGroupUpdates(data.deviceId, {
              data: data,
              filter: "Gps_Device_Data"
            });
            socketSubscribedUser[0][data.deviceId].time = new Date();
          }
        }
      }
    });
  });
  app.all("/rest/notifyGroup", (req, res) => {
    try {
      const requestParams = Utility.getRequestParams(req);
      const groupId = parseJSON(requestParams.groupid);
      const data = parseJSON(requestParams.data);
      const options = parseJSON(requestParams.options);
      console.log("data>>>>>>>>>>>>>>>>>>>>>>>>in socket server", data);
      if (data.filter === "onAccept") {
        let subscribedData = {
          [data.trip.deviceId]: {
            latitude: data.trip.patientLocation.lat,
            longitude: data.trip.patientLocation.long
          }
        };
        console.log("subscribed data", subscribedData);
        console.log("inside onAccept on socket data", data);
        subscribedUser.push(subscribedData);
        console.log("after accepting request", subscribedUser);
      }
      if (data.filter === "RemovePatient") {
        subscribedUser.splice(
          subscribedUser.findIndex(item => item[data.deviceId]),
          1
        );
        console.log("after removing deviceId", subscribedUser);
      }
      if (data.filter === "MarkComplete") {
        subscribedUser.splice(
          subscribedUser.findIndex(item => item[data.trip.deviceId]),
          1
        );
      }
      emitGroupUpdates(groupId, data, options);
      res.send({ status: 200, message: "Update Successfully" });
    } catch (error) {
      res.send({ status: 400, message: error.message });
    }
  });
};
const parseJSON = data => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (err) {
      return data;
    }
  } else {
    return data;
  }
};

const emitGroupUpdates = (groups, update, options) => {
  console.log("updating groups", groups, update);
  options = options || {};
  if (groups instanceof Array) {
    groups.forEach(group => {
      io.to(group).emit("updateInRow", { group, data: update, options });
    });
  } else {
    io.to(groups).emit("updateInRow", { group: groups, data: update, options });
  }
};

const joinGroup = (socketId, groups) => {
  const socket = io.sockets.sockets[socketId];
  if (socket) {
    if (groups instanceof Array) {
      groups.forEach(group => {
        socket.join(group);
      });
    } else {
      socket.join(groups);
    }
  }
};

const leaveGroup = (socketId, groups) => {
  const socket = io.sockets.sockets[socketId];
  if (socket) {
    if (groups instanceof Array) {
      groups.forEach(group => {
        socket.leave(group);
      });
    } else {
      socket.leave(groups);
    }
  }
};

module.exports = {
  configure,
  emitGroupUpdates
};
