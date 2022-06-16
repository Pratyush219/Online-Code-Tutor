var client = io("http://localhost:9999");
var colorPicker = document.getElementById('line-color');
var lineColor = colorPicker.value;

console.log(colorPicker.offsetHeight);
let connid;
let prevX = -1, prevY = -1;
let diff = colorPicker.offsetHeight;
client.on("connect", () => {
    console.log(`${client.id} connected`);
    client.emit('request-data');
});
let canvas = document.getElementById("canvas");
canvas.width = Math.max(0.98 * window.innerWidth, canvas.width);
canvas.height = Math.max(window.innerHeight, canvas.height);
let ctx = canvas.getContext("2d");
let XOFFSET = 0, YOFFSET = 0;
let x;
let y;
let mouseDown = false;
window.onmousedown = function (e) {
    console.log(typeof(e));
    client.emit("down", { X: e.clientX + XOFFSET, Y: e.clientY + YOFFSET });
    ctx.moveTo(e.clientX + XOFFSET, e.clientY + YOFFSET - diff);
    mouseDown = true;
};
window.onresize = function () {
    let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = Math.max(window.innerWidth, canvas.width);
    canvas.height = Math.max(window.innerHeight, canvas.height);
    ctx.putImageData(data, 0, 0);
};
window.onscroll = function () {
    // console.log(window.scrollX);
    // console.log(window.scrollY);
    XOFFSET = window.scrollX;
    YOFFSET = window.scrollY;
};
window.onmouseup = function (e) {
    mouseDown = false;
    ctx.beginPath();
};
client.on('get-data', newSocketID => {
    // let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log(`Data requested from ${client.id}`);
    let dataUrl = canvas.toDataURL();
    client.emit('receive-data', dataUrl, newSocketID);
})
client.on('new-connection', imageData => {
    if(imageData != null) {
        console.log(imageData);
        var img = new Image();
        img.onload = function () {
            ctx.drawImage(img, 0, 0); // Or at whatever offset you like
        };
        img.src = imageData;
    }
    else console.log("No data");
})
client.on("onDown", (x, y) => {
    ctx.moveTo(x, y - diff);
});
client.on("onDraw", (x, y, colorData) => {
    drawPixel(x, y, colorData);
    prevX = x;
    prevY = y;
});

colorPicker.onchange = function() {
    ctx.closePath();
}
window.onmousemove = function (e) {
    lineColor = colorPicker.value;
    x = XOFFSET + e.clientX;
    y = YOFFSET + e.clientY;
    if (mouseDown) {
        client.emit("draw", { X: x, Y: y, colorVal: colorPicker.value });
        drawPixel(x, y, lineColor);
        prevX = x;
        prevY = y;
    }
};
function drawPixel(x, y, colorData) {
    console.log(lineColor);
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = colorData;
    ctx.lineTo(x, y - diff);
    ctx.stroke();
}
