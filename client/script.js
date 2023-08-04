const socket = io();
var messages = document.getElementById("messages");
var form = document.getElementById("form");
var input = document.getElementById("input");

socket.on("connect", () => {
	console.log("connect");
});

socket.on("user-count", (userCount) => {
	let count = document.querySelector("#user-count");
	count.innerHTML = `online: ${userCount}`;
});
