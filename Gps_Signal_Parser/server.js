const NET = require("net");
const { socketURL } = require("./config");
const SocketIoClient = require("socket.io-client");
const {
  authenticateLoginRequest,
  authenticateHeartBeatRequest,
  parseGPSData,
  parsePositionRequest
} = require("./src/index");
let socket = SocketIoClient.connect(socketURL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 99999,
  secure: true
});
let data1 = 1;
let deviceTime = [{ "1230": { time: new Date() } }];
function checkSignalTime(deviceId, time) {
  let time1 = deviceTime[0][deviceId].time;
  let diff = (time.getTime() - time1.getTime()) / 1000;
  // console.log("time",time.getTime(),"stored time",time1.getTime())
  console.log("time corresponding to device id", Math.floor(diff));
  if (Math.floor(diff) >= 10) {
    deviceTime[0][deviceId].time = time;
    return true;
  }
  return false;
}
NET.createServer(function(connection) {
  connection.on("error", err => {
    connection.destroy();
  });
  connection.on("data", function(data) {
    console.log("connection created", data);
    // socket.emit("gps_Signal",{deviceId:"559874",latitude:29.142787899999995,longitude:75.7305619,angle:180});
    try {
      var init = data.slice(0, 2).toString("ascii");
      var cmd = data.slice(3, 4).toString("hex");
      if (init == "xx" && (cmd == "1" || cmd == "01" || cmd == 1)) {
        console.log("cmd", cmd);
        var deviceId = authenticateLoginRequest(data, 14, connection);
        console.log("device id", deviceId);
        connection.name =
          connection.remoteAddress + ":" + connection.remotePort;
        connection.deviceId = deviceId;
      } else if (init == "xx" && (cmd == "12" || cmd == 12)) {
        console.log("cmd", cmd);
        var deviceId = connection.deviceId ? connection.deviceId : "0";
        var dataArray = data.toString("hex").split("7878");
        for (var i in dataArray) {
          if (dataArray[i].trim().length > 0) {
            var dataPart = new Buffer("7878" + dataArray[i], "hex");
            var positionData = parsePositionRequest(dataPart, "AXES");
            var dataToSend = parseGPSData(positionData, dataPart, 32);
            if (dataToSend) {
              dataToSend.imei = deviceId;
              if (dataToSend.latitude && dataToSend.longitude) {
                console.log("after Parsing", dataToSend);
                //   if(checkSignalTime("1230",new Date()))
                socket.emit("gps_Signal", {
                  deviceId: dataToSend.imei,
                  latitude: dataToSend.latitude,
                  longitude: dataToSend.longitude,
                  angle: dataToSend.angle
                });
              }
            }
          }
        }
      } else if (init == "xx" && (cmd == "13" || cmd == 13)) {
        authenticateHeartBeatRequest(data, connection);
      }
    } catch (err) {
      console.log("Error: >> ", err);
    }
  });
}).listen(5005, () => {
  console.log("Track06 Server running ", 5005);
});
