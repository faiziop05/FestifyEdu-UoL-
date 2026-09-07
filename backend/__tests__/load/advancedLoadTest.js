require("dotenv").config();
const mongoose = require("mongoose");
const { io } = require("socket.io-client");
const Classrooms = require("../../src/models/classrooms");
const StudentSessions = require("../../src/models/studentSessions");
const Users = require("../../src/models/users");
const Organizations = require("../../src/models/organizations");

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5001";
const NUM_ROOMS = 10;
const USERS_PER_ROOM = 30;
const TOTAL_CLIENTS = NUM_ROOMS * USERS_PER_ROOM;

let connectedClients = 0;
let receivedEvents = 0;
let joinedRooms = 0;
let studentSockets = [];
let teacherSockets = [];

async function setupDatabase() {
  console.log("Connecting to DB...");
  await mongoose.connect(process.env.MONGO_URI);

  // Cleanup old test data
  console.log("Cleaning old load test data...");
  await Classrooms.deleteMany({ name: /^LOAD_TEST_/ });
  await StudentSessions.deleteMany({ display_name: /^LOAD_TEST_STUDENT_/ });
  await Users.deleteMany({ email: "loadtest@example.com" });
  await Organizations.deleteMany({ domain: "loadtest.com" });

  console.log("Creating mock organization and teacher...");
  const org = await Organizations.create({
    organization_name: "Load Test Org",
    domain: "loadtest.com",
    country: "UK",
    postcode: "123",
    city: "London",
    address: "123 Test St",
  });

  const teacher = await Users.create({
    name: "Load Test Teacher",
    email: "loadtest@example.com",
    password: "password",
    role: "teacher",
    organization_id: org._id,
  });

  const roomsData = [];
  console.log(
    `Creating ${NUM_ROOMS} rooms with ${USERS_PER_ROOM} students each...`,
  );

  for (let i = 0; i < NUM_ROOMS; i++) {
    const room = await Classrooms.create({
      room_code: `LT_${10000 + i}`,
      teacher_id: teacher._id,
      name: `LOAD_TEST_ROOM_${i}`,
      status: "active",
    });

    const students = [];
    for (let j = 0; j < USERS_PER_ROOM; j++) {
      const student = await StudentSessions.create({
        classroom_id: room._id,
        display_name: `LOAD_TEST_STUDENT_${i}_${j}`,
        student_id: `stu_${i}_${j}`,
      });
      students.push({ session_id: student._id.toString() });
    }
    roomsData.push({ room_code: room.room_code, students });
  }

  return roomsData;
}

async function runTest() {
  const roomsData = await setupDatabase();
  console.log("Database seeded. Starting socket connections...");

  const startTime = Date.now();

  // Connect teachers
  roomsData.forEach((roomInfo) => {
    const tSocket = io(SERVER_URL, { reconnection: false });
    tSocket.on("connect", () => {
      tSocket.emit("join_room_teacher", { room_code: roomInfo.room_code });
    });
    teacherSockets.push({ socket: tSocket, room_code: roomInfo.room_code });
  });

  // Connect students
  roomsData.forEach((roomInfo) => {
    roomInfo.students.forEach((student) => {
      const sSocket = io(SERVER_URL, { reconnection: false });
      sSocket.on("connect", () => {
        connectedClients++;
        sSocket.emit("join_room_student", {
          room_code: roomInfo.room_code,
          session_id: student.session_id,
        });

        if (connectedClients === TOTAL_CLIENTS) {
          const connectTime = Date.now() - startTime;
          console.log(
            `\n All ${TOTAL_CLIENTS} students connected via TCP in ${connectTime}ms`,
          );
        }
      });

      sSocket.on("room_updated", () => {
        joinedRooms++;
        if (joinedRooms === TOTAL_CLIENTS) {
          console.log(`\n All ${TOTAL_CLIENTS} students fully joined their DB rooms. Waiting 2s before broadcast...`);
          setTimeout(() => {
            console.log(
              "Broadcasting event from all teachers simultaneously...",
            );
            const eventStartTime = Date.now();
            teacherSockets.forEach((t) => {
              t.socket.emit("end_session", { room_code: t.room_code });
            });

            let checks = 0;
            const checkInterval = setInterval(() => {
              checks++;
              if (receivedEvents === TOTAL_CLIENTS || checks > 30) {
                const eventTime = Date.now() - eventStartTime;
                console.log(
                  `\n✅ ${receivedEvents}/${TOTAL_CLIENTS} students received broadcast in ${eventTime}ms`,
                );
                cleanup();
                clearInterval(checkInterval);
              }
            }, 100);
          }, 2000);
        }
      });

      sSocket.on("session_ended", () => {
        receivedEvents++;
      });

      studentSockets.push(sSocket);
    });
  });
}

async function cleanup() {
  console.log("Cleaning up...");
  teacherSockets.forEach((t) => t.socket.disconnect());
  studentSockets.forEach((s) => s.disconnect());
  await Classrooms.deleteMany({ name: /^LOAD_TEST_/ });
  await StudentSessions.deleteMany({ display_name: /^LOAD_TEST_STUDENT_/ });
  await Users.deleteMany({ email: "loadtest@example.com" });
  await Organizations.deleteMany({ domain: "loadtest.com" });
  await mongoose.disconnect();
  console.log("Load test completed successfully.");
  process.exit(0);
}

runTest().catch(console.error);
