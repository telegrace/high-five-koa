import Koa from "koa";
import http from "http";
import path from "path";
import serve from "koa-static";
import { Server, Socket } from "socket.io";

const PORT = process.env.PORT || 3000;
const app = new Koa();

const server = http.createServer(app.callback());
const io = new Server(server);

const staticDirPath = path.join(__dirname, "client");
app.use(serve(staticDirPath));

let userCount = 0;

const userList: Record<string, string> = {};

io.on("connection", (socket: Socket) => {
	userCount++;

	userList[socket.id] = socket.id;
	io.emit("new-connection", { userCount, connectingUserId: socket.id });
	console.log("socket.id", socket.id);

	socket.on("request-user-list", () => {
		socket.emit("user-list", userList);
	});

	socket.on("mouse-move", ({ userId, mouseX, mouseY }) => {
		console.log("mouse-move", userId, mouseX, mouseY);
		socket.broadcast.emit("other-hand", { userId, mouseX, mouseY });
	});

	socket.on("disconnect", () => {
		userCount--;
		delete userList[socket.id];
		io.emit("user-disconnected", { userCount, disconnectedUserId: socket.id });
	});
});

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT} 🥳`);
});
