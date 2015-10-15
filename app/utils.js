function dateToIso(date_str){
  var date = date_str.trim().split('/');
  return date[2]+'-'+date[1]+'-'+date[0];
};

function timeToIso(time_str) {
  var time_parts = time_str.split(' ');
  var time_formatted = '';
  if (time_parts[1] == "PM") {
    var hour_parts = time_parts[0].split(':');
    time_formatted = (Number(hour_parts[0])+12) + ":" + hour_parts[1] + ":00";
  } else {
    time_formatted = time_parts[0] + ':00';
  }
  return time_formatted;
};

function datetimeToIso(date_str) {
  date_str = date_str.trim();
  var date = date_str.split(" ");
  timeToIso(date[1]+' '+date[2]);
  return dateToIso(date[0]) + ' ' + timeToIso(date[1] + ' ' + date[2]);
};

module.exports = {
  dateToIso: dateToIso,
  //timeToIso: timeToIso,
  datetimeToIso: datetimeToIso
};