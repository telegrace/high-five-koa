const socket = io();
const count = document.querySelector("#user-count");
const playground = document.getElementById("playground");

let myId;

socket.on("connect", () => {
	myId = socket.id;
});

socket.on("new-connection", ({ userCount, connectingUserId }) => {
	count.innerHTML = `online: ${userCount}`;
	const amILast = connectingUserId === myId;
	if (amILast) {
		if (userCount > 4) {
			let rejected = document.createElement("div");
			rejected.textContent = "Not today, max players reached";
			playground.appendChild(rejected);
			return;
		}
		let myHand = document.createElement("div");
		myHand.className = "my-hand";
		myHand.id = connectingUserId;
		myHand.textContent = "✋";
		playground.appendChild(myHand);
		socket.emit("request-user-list");

		let myHandX;
		let myHandY;
		let isMoving;
		let timer;

		function handleMouseInactivity() {
			clearTimeout(timer);
			timer = setTimeout(() => {
				isMoving = false;
			}, 1000);
		}
		playground.addEventListener("mousemove", (event) => {
			handleMouseInactivity();
			if (myHandX == event.clientX && myHandY == event.clientY) {
				isMoving = false;
			} else {
				isMoving = true;
				followMouse(myHand, event);
				myHandX = event.clientX;
				myHandY = event.clientY;
			}
		});

		setInterval(() => {
			if (isMoving) {
				socket.emit("mouse-move", {
					userId: myId,
					mouseX: myHandX,
					mouseY: myHandY,
				});
			}
		}, 100);
	} else {
		let newHand = document.createElement("div");
		newHand.className = "other-hand";
		newHand.id = connectingUserId;
		newHand.textContent = "✋";
		playground.appendChild(newHand);
	}
});

socket.on("user-list", (userList) => {
	for (const user in userList) {
		if (user !== myId) {
			let hand = document.createElement("div");
			hand.className = "other-hand";
			hand.id = user;
			hand.textContent = "✋";
			playground.appendChild(hand);
		}
	}
});

socket.on("other-hand", ({ userId, mouseX, mouseY }) => {
	console.log("other hand");
	console.log(userId, mouseX, mouseY);
	let hand = document.getElementById(userId);
	hand.style.left = mouseX + "px";
	hand.style.top = mouseY + "px";
	hand.style.display = "unset";
});

socket.on("user-disconnected", ({ userCount, disconnectedUserId }) => {
	count.innerHTML = `online: ${userCount}`;
	document.getElementById(disconnectedUserId).remove();
	console.log("Disconnected", disconnectedUserId);
});

const followMouse = (userHand, event) => {
	event.preventDefault();
	let mouseX = event.clientX;
	let mouseY = event.clientY;

	let width = userHand.offsetWidth;

	let userHandLeft = mouseX - width / 2;
	let userHandTop = mouseY - width / 2;

	userHand.style.left = userHandLeft + "px";
	userHand.style.top = userHandTop + "px";
};

function debounce(func, timeout = 300) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
}
