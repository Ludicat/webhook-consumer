export const getTime = function () {
  var currentdate = new Date();
  return currentdate.getFullYear() + "-"
    + (currentdate.getMonth() + 1) + "-"
    + currentdate.getDate() + " "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();
}