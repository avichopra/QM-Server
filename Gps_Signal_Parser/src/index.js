const crc16 = require('node-crc-itu');
exports.authenticateLoginRequest = (data, crcLength, connection) => {
  var parsedDataObj = parseLoginRequest(data);
  var crcChecksum = crc16(data.slice(2, crcLength)).toString(16);
  var deviceId = Number(parsedDataObj.device_id.toString('hex'));
  var checksum = parsedDataObj.checksum.toString('hex');
  console.log('CRC: ', crcChecksum);
  if (crcChecksum == checksum || crcChecksum == parseInt(checksum)) {
    var respBuff = new Buffer(10);
    respBuff[0] = 0x78;
    respBuff[1] = 0x78;
    respBuff[2] = 0x05;
    respBuff[3] = 0x01;
    respBuff[4] = 0x00;
    respBuff[5] = 0x01;
    respBuff[6] = 0xd9;
    respBuff[7] = 0xdc;
    respBuff[8] = 0x0d;
    respBuff[9] = 0x0a;
    console.log('Response authenticateLoginRequest : ', respBuff.toString('hex'));
    connection.write(respBuff);
  }
  return deviceId;
};
exports.authenticateHeartBeatRequest = (data, connection) => {
  var parsedDataObj = parseHeartBeatStatusInfo(data);
  var checksum = parsedDataObj.checksum.toString('hex');
  var crcChecksum = crc16(data.slice(2, 11)).toString(16);
  console.log('13 CRC ::: ', crcChecksum);
  console.log('parsedDataObj :: ', parsedDataObj);
  if (crcChecksum == checksum || crcChecksum == parseInt(checksum)) {
    var serialNo = parsedDataObj.info_serial_no.toString('hex');
    var s1 = serialNo.substr(0, 2);
    var s2 = serialNo.substr(2, 2);
    var newChecksum = crc16('0513' + s1 + s2).toString(16);
    if (newChecksum.length == 3) {
      newChecksum = '0' + newChecksum;
    } else if (newChecksum.length == 2) {
      newChecksum = '00' + newChecksum;
    } else if (newChecksum.length == 1) {
      newChecksum = '000' + newChecksum;
    }
    var respBuff = new Buffer(10);
    respBuff[0] = 0x78;
    respBuff[1] = 0x78;
    respBuff[2] = 0x05;
    respBuff[3] = 0x13;
    respBuff[4] = '0x' + serialNo.substr(0, 2);
    respBuff[5] = '0x' + serialNo.substr(2, 2);
    respBuff[6] = '0x' + newChecksum.substr(0, 2);
    respBuff[7] = '0x' + newChecksum.substr(2, 2);
    respBuff[8] = 0x0d;
    respBuff[9] = 0x0a;
    console.log('Response authenticateHeartBeatRequest : ', respBuff.toString('hex'));
    connection.write(respBuff);
  }
};
exports.parseGPSData = (positionData, data, crcLength, offset) => {
  var checksum = positionData.checksum.toString('hex');
  var crcChecksum = crc16(data.slice(2, crcLength)).toString(16);
  if (crcChecksum.length == 3) {
    crcChecksum = '0' + crcChecksum;
  } else if (crcChecksum.length == 2) {
    crcChecksum = '00' + crcChecksum;
  } else if (crcChecksum.length == 1) {
    crcChecksum = '000' + crcChecksum;
  }
  var gpsData = positionData.gps_info;
  console.log(' CRC :: ', crcChecksum);
  console.log('checksum :: ', checksum);
  console.log('gpsData :: ', gpsData);
  if (gpsData && (crcChecksum == checksum || crcChecksum == parseInt(checksum))) {
    var lat = gpsData.latitude ? gpsData.latitude : undefined;
    var long = gpsData.longitude ? gpsData.longitude : undefined;
    var speed = gpsData.speed ? gpsData.speed : undefined;
    var direction = gpsData.direction ? gpsData.direction : undefined;
    var dateTime = gpsData.date_time ? gpsData.date_time : undefined;
    var uploadStatus = positionData.upload_status ? positionData.upload_status : undefined;

    var res = {
      network_provider: 'GPS',
      isGPSEnabled: true,
      sequence: 0,
      isStart: true,
      parser: 'Track06'
    };
    var latDir = 'S';
    var longDir = 'E';
    var gpsPositioned = false;
    var gpsRealTime = true;
    if (uploadStatus) {
      res.history_data = uploadStatus.readUInt8(0) == 1 ? true : false;
    }
    if (direction) {
      var byte1 = completeBinary(direction.readUInt8(0).toString(2));
      var byte2 = completeBinary(direction.readUInt8(1).toString(2));
      if (byte1.charAt(2) == 1) {
        gpsRealTime = false;
      }
      if (byte1.charAt(3) == 1) {
        gpsPositioned = true;
      }
      if (byte1.charAt(4) == 1) {
        longDir = 'W';
      }
      if (byte1.charAt(5) == 1) {
        latDir = 'N';
      }
      res.gpsPositioned = gpsPositioned;
      res.gpsRealTime = gpsRealTime;
      res.angle = parseInt(byte1.substr(6, 2) + byte2, 2);
    }
    if (lat) {
      lat = lat.readInt32BE(0);
      var decimal = Number(lat) / 30000;
      var seconds = decimal - Math.floor(decimal);
      var minutes = decimal - seconds;
      var degreeDecimal = Number(minutes) / 60;
      minutes = degreeDecimal - Math.floor(degreeDecimal);
      var degree = degreeDecimal - minutes;
      var result = degree.toString() + Number(minutes * 60 + seconds).toFixed(4);
      res.latitude = degreeToDecimal(result, latDir);
    }
    if (long) {
      lat = long.readInt32BE(0);
      var decimal = Number(lat) / 30000;
      var seconds = decimal - Math.floor(decimal);
      var minutes = decimal - seconds;
      var degreeDecimal = Number(minutes) / 60;
      minutes = degreeDecimal - Math.floor(degreeDecimal);
      var degree = degreeDecimal - minutes;
      var result = degree.toString() + Number(minutes * 60 + seconds).toFixed(4);
      res.longitude = degreeToDecimal(result, longDir);
    }
    if (speed) {
      res.speed = parseInt(speed.readUInt8(0));
    }

    if (dateTime) {
      res.device_time = getDeviceTime(dateTime, offset);
      res.timestamp = res.device_time.getTime();
    }
    res.acc_status = positionData.acc_status.toString('hex') == '01' ? true : false;
    res.altitude = 0;
    res.server_time = new Date();
    console.log('parsed Data :: ', res);
    return res;
  }
};
exports.parsePositionRequest = (data, vendor) => {
  var parsedDataObj = {};
  parsedDataObj.header = data.slice(0, 2);
  parsedDataObj.length = data.slice(2, 3);
  parsedDataObj.command = data.slice(3, 4);
  parsedDataObj.gps_info = parseGpsInfo(data.slice(4, 22));
  if (vendor && vendor == 'AXES') {
    parsedDataObj.upload_status = data.slice(data.length - 7, data.length - 6);
  }
  parsedDataObj.acc_status = data.slice(data.length - 9, data.length - 8);
  parsedDataObj.info_serial_no = data.slice(data.length - 6, data.length - 4);
  parsedDataObj.checksum = data.slice(data.length - 4, data.length - 2);
  parsedDataObj.footer = data.slice(data.length - 2, data.length);
  return parsedDataObj;
};
const parseHeartBeatStatusInfo = data => {
  var parsedDataObj = {};
  parsedDataObj.header = data.slice(0, 2);
  parsedDataObj.length = data.slice(2, 3);
  parsedDataObj.command = data.slice(3, 4);
  parsedDataObj.status_info = parseStatusInfo(data.slice(4, 9));
  parsedDataObj.info_serial_no = data.slice(9, 11);
  parsedDataObj.checksum = data.slice(data.length - 4, data.length - 2);
  parsedDataObj.footer = data.slice(data.length - 2, data.length);
  return parsedDataObj;
};
const parseStatusInfo = data => {
  var parsedDataObj = {};
  parsedDataObj.terminal_info = data.slice(0, 1);
  parsedDataObj.voltage = data.slice(1, 2);
  parsedDataObj.gsm_signal = data.slice(2, 3);
  parsedDataObj.alarm = data.slice(3, 5);
  return parsedDataObj;
};
const parseLoginRequest = (data, vendor) => {
  var parsedDataObj = {};
  parsedDataObj.header = data.slice(0, 2);
  parsedDataObj.length = data.slice(2, 3);
  parsedDataObj.command = data.slice(3, 4);
  parsedDataObj.device_id = data.slice(4, 12);
  if (vendor && vendor == 'AXES') {
    parsedDataObj.type_code = data.slice(12, 14);
    parsedDataObj.zone = data.slice(14, 16);
  }
  parsedDataObj.info_serial_no = data.slice(data.length - 6, data.length - 4);
  parsedDataObj.checksum = data.slice(data.length - 4, data.length - 2);
  parsedDataObj.footer = data.slice(data.length - 2, data.length);
  return parsedDataObj;
};
const completeBinary = data => {
  var diff = 8 - data.length;
  var result = '';
  for (var i = 0; i < diff; i++) {
    result += '0';
  }
  return result + data;
};

const parseGpsInfo = data => {
  var parsedDataObj = {};
  parsedDataObj.date_time = data.slice(0, 6);
  parsedDataObj.satellites = data.slice(6, 7);
  parsedDataObj.latitude = data.slice(7, 11);
  parsedDataObj.longitude = data.slice(11, 15);
  parsedDataObj.speed = data.slice(15, 16);
  parsedDataObj.direction = data.slice(16, 18);
  return parsedDataObj;
};
const getDeviceTime = (data, offset) => {
  var year = parseInt(data.readUInt8(0));
  var month = parseInt(data.readUInt8(1));
  var day = parseInt(data.readUInt8(2));
  var date = new Date(year + 2000, month - 1, day);
  date.setHours(parseInt(data.readUInt8(3)));
  date.setMinutes(parseInt(data.readUInt8(4)));
  date.setSeconds(parseInt(data.readUInt8(5)));
  if (offset) {
    offset = offset.split(':');
    if (offset[0]) {
      date.setHours(date.getHours() - parseInt(offset[0]));
    }
    if (offset[1]) {
      date.setMinutes(date.getMinutes() - parseInt(offset[1]));
    }
  }
  return date;
};
const degreeToDecimal = (pos, pos_i) => {
  if (typeof pos_i == 'undefined') pos_i = 'N';
  var data = pos.toString().split('.');
  var sec = data[1];
  var dg = data[0].substr(0, 2);
  var min = data[0].substr(2, 2);
  var res = (parseInt(dg) + parseFloat(min + '.' + sec) / 60).toFixed(7);
  return pos_i.toUpperCase() == 'S' || pos_i.toUpperCase() == 'W' ? res * -1 : res;
};
