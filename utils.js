let pad = (num => {
    return (num < 10 ? '0' : '') + num;
})

let formatTime = (seconds => {
    let hrs = Math.floor(seconds / (60 * 60));
    let min = Math.floor(seconds % (60 * 60) / 60);
    let sec = Math.floor(seconds % 60);

    return pad(hrs) + ':' + pad(min) + ':' + pad(sec);
})

let isValidURL = (string => {
    let res = string.match(/https?:\/\/.?(www\.)?[-a-zA-Z\d@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z\d@:%_+.~#?&/=]*)/g);

    return (res !== null);
})

module.exports = {
    pad,
    formatTime,
    isValidURL
};