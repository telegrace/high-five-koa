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

io.on("connection", (socket: Socket) => {
	userCount++;
	io.emit("user-count", userCount);
	socket.on("disconnect", () => {
		userCount--;
		io.emit("user-count", userCount);
	});
});

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT} 🥳`);
});
