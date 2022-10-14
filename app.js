const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const { open } = sqlite;

const app = express();

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/players/", async (request, response) => {
  const getPlayers = `SELECT * FROM cricket_team ORDER BY player_id`;
  const playersList = await db.all(getPlayers);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

  let modifiedFormat = [];
  for (let dbObject of playersList) {
    let list = convertDbObjectToResponseObject(dbObject);
    modifiedFormat.push(list);
  }
  response.send(modifiedFormat);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayer = `
    INSERT INTO
      cricket_team (player_name,jersey_number,role)
    VALUES
      (${playerName},${jerseyNumber},${role});`;

  const dbResponse = await db.run(addPlayer);
  const player_id = dbResponse.lastID;
  response.send("Player Added to Team");
});
