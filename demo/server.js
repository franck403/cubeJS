import express from "express";
import { PeerServer } from "peer";

const app = express();
app.use(express.static("public")); // serve client pages
const peerServer = PeerServer({ port: 9000, path: "/peerjs" });
app.listen(3000, () => console.log("Server on http://localhost:3000"));
