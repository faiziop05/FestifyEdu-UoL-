const { io } = require("socket.io-client");

const SERVER_URL = "http://localhost:5001";
const NUM_CLIENTS = 40;
const ROOM_CODE = "LOAD_TEST_ROOM";

let connectedClients = 0;
let clients = [];

console.log(
  `Starting Load Test: Spawning ${NUM_CLIENTS} concurrent socket connections...`,
);

for (let i = 0; i < NUM_CLIENTS; i++) {
  // We need a dummy session_id for the join_room_student event to work without crashing,
  // but since we aren't validating it in the DB in this pure load test (or we mock it if needed),
  // we just simulate raw connections.
  const socket = io(SERVER_URL, {
    reconnection: false,
  });

  socket.on("connect", () => {
    connectedClients++;
    console.log(`[Client ${i}] Connected (${connectedClients}/${NUM_CLIENTS})`);

    // Simulate joining room
    // Note: In real app it hits DB. If DB is slow, this will show it.
    // For pure socket stress test, just join a room manually if we bypass DB,
    // but we will send the actual event to see how server handles it.
    socket.emit("join_room_student", {
      room_code: ROOM_CODE,
      session_id: `dummy_session_${i}`,
    });

    if (connectedClients === NUM_CLIENTS) {
      console.log(
        `\n Successfully connected all ${NUM_CLIENTS} clients simultaneously!`,
      );

      // Simulate teacher broadcasting an event
      console.log(`Simulating event broadcast to ${NUM_CLIENTS} clients...`);
      let receivedCount = 0;

      clients.forEach((c) => {
        c.on("session_ended", () => {
          receivedCount++;
          if (receivedCount === NUM_CLIENTS) {
            console.log(
              ` All ${NUM_CLIENTS} clients successfully received the broadcasted event in real-time!`,
            );
            console.log("Load test passed. Disconnecting...");
            clients.forEach((client) => client.disconnect());
            process.exit(0);
          }
        });
      });

      // We need a way to trigger the event. Let's just use one socket to pretend to be the teacher.
      setTimeout(() => {
        clients[0].emit("end_session", { room_code: ROOM_CODE });
      }, 1000);
    }
  });

  socket.on("connect_error", (err) => {
    console.error(`[Client ${i}] Connection Error:`, err.message);
  });

  clients.push(socket);
}
