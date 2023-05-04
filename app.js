const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
let database = null;
const createDbAndConnect = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () => {
      console.log("Server Running");
    });
  } catch (error) {
    console.log(`Error ${error.message}`);
    process.exit(1);
  }
};
createDbAndConnect();

const createPriorityAndStatus = (eachItem) => {
  return eachItem.priority !== undefined && eachItem.status !== undefined;
};

const createPriority = (eachItem) => {
  return eachItem.priority !== undefined;
};

const createStatus = (eachItem) => {
  return eachItem.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = null;
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case createPriorityAndStatus(request.query):
      getTodoQuery = `SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%' AND status='${status}' AND priority='${priority}';`;
      break;

    case createPriority(request.query):
      getTodoQuery = `SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%' AND priority='${priority}';`;
      break;

    case createStatus(request.query):
      getTodoQuery = `SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%' AND status='${status}';`;
      break;

    default:
      getTodoQuery = `SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%';`;
      break;
  }
  data = await database.all(getTodoQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `SELECT *
    FROM todo
    WHERE id=${todoId};`;
  const dbResponse = await database.get(getQuery);
  response.send(dbResponse);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const getQueryAnswer = `INSERT INTO todo(id,todo,priority,status)
    VALUES('${id}','${todo}','${priority}','${status}');`;
  const addedData = await database.run(getQueryAnswer);
  response.send("Todo Successfully Added");
});

const createStatus2 = (eachItem) => {
  return eachItem.status !== undefined;
};

const createPriority2 = (eachItem) => {
  return eachItem.priority !== undefined;
};

app.put("/todos/:todoId/", async (request, response) => {
  let data1 = null;
  const { todoId } = request.params;
  const { search_q, priority, status } = request.body;
  if (
    status !== undefined &&
    priority === undefined &&
    search_q === undefined
  ) {
    const getTodoQuery1 = `UPDATE todo
          SET status='${status}'
          WHERE id='${todoId}';`;
    await database.run(getTodoQuery1);
    response.send("Status Updated");
  } else if (
    priority !== undefined &&
    status === undefined &&
    search_q === undefined
  ) {
    const getTodoQuery3 = `UPDATE todo
          SET priority='${priority}'
          WHERE id='${todoId}';`;
    await database.run(getTodoQuery3);
    response.send("Priority Updated");
  } else {
    const getTodoQuery4 = `UPDATE todo
          SET todo='${search_q}'
          WHERE id='${todoId}';`;
    await database.run(getTodoQuery4);
    response.send("Todo Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `DELETE
    FROM todo
    WHERE id=${todoId};`;
  await database.run(getQuery);
  response.send("Todo Deleted");
});

module.exports = app;
