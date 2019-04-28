require("dotenv").config();
const express = require("express");
const logger = require("morgan"); // prints all RESTful requests to the console
const bodyParser = require("body-parser");
const cors = require("cors");
const Joi = require("joi");
const multer = require("multer");
const fs = require("fs");
const upload = multer({ dest: "tmp/" });
const path = require("path");
const models = require("./models");

// Gets all the controllers to be used
const cabinetControllers = require("./controllers").cabinets;
const creanciersController = require("./controllers").creanciers;
const debiteursController = require("./controllers").debiteurs;
const facturesController = require("./controllers").factures;
const avoirsController = require("./controllers").avoirs;
const acomptesController = require("./controllers").acomptes;
const partielsController = require("./controllers").partiels;
const actionsController = require("./controllers").actions;
const medController = require("./controllers").med;
const injonctionController = require("./controllers").injonction;
const recapController = require("./controllers").recap;

// Set up the express app
const app = express();

// Log requests to the console if the app is in Dev environment
if (app.get("env") === "development") {
  app.use(logger("tiny"));
  console.log("Dev environment: Morgan is running");
}

app.use(cors());

// Parses the body of any request catched
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const publicFolder = express.static(path.join(__dirname, "public"));
app.use(publicFolder);

// CRUD routes for the Cabinet
app.post("/api/cabinet", cabinetControllers.create);
app.get("/api/cabinet", cabinetControllers.list);
app.put("/api/cabinet/:cabinetId", cabinetControllers.update);
app.delete("/api/cabinet/:cabinetId", cabinetControllers.destroy);

// CRUD routes for the Creanciers
app.post("/api/creanciers", creanciersController.create);
app.get("/api/creanciers", creanciersController.list);
app.put("/api/creanciers/:creancierId", creanciersController.update);
app.delete("/api/creanciers/:creancierId", creanciersController.destroy);

// CRUD routes for the Debiteurs
app.get("/api/debiteurs", debiteursController.list);
app.post("/api/debiteurs", debiteursController.create);
app.put("/api/debiteurs/:debiteurId", debiteursController.update);
app.delete("/api/debiteurs/:debiteurId", debiteursController.destroy);

// CRUD routes for the Factures
app.get("/api/factures/:factureId", facturesController.get);
app.get("/api/factures", facturesController.list);
app.post("/api/factures", facturesController.create);
app.put("/api/factures/:factureId", facturesController.update);
app.delete("/api/factures/:factureId", facturesController.destroy);

// CRUD routes for the Avoirs
app.get("/api/avoirs", avoirsController.list);
app.post("/api/avoirs", avoirsController.create);
app.put("/api/avoirs/:avoirId", avoirsController.update);
app.delete("/api/avoirs/:avoirId", avoirsController.destroy);

// CRUD routes for the Acomptes
app.get("/api/acomptes", acomptesController.list);
app.post("/api/acomptes", acomptesController.create);
app.put("/api/acomptes/:acompteId", acomptesController.update);
app.delete("/api/acomptes/:acompteId", acomptesController.destroy);

// CRUD routes for the Paiements_Partiels
app.get("/api/partiels", partielsController.list);
app.post("/api/partiels", partielsController.create);
app.put("/api/partiels/:partielId", partielsController.update);
app.delete("/api/partiels/:partielId", partielsController.destroy);

// CRUD routes for the Actions

app.get("/api/actions/:actionId/", actionsController.get);
app.get("/api/actions", actionsController.list);
app.post("/api/actions", actionsController.create);
app.put("/api/actions/:actionId", actionsController.update);
app.delete("/api/actions/:actionId", actionsController.destroy);

// Documents creation
app.get("/api/documents/createMed/:id/", medController.createMed);
app.get(
  "/api/documents/createInjonction/:id/",
  injonctionController.createInjonction
);
app.get("/api/documents/createRecap/:id/", recapController.createRecap);

// Setup of a default catch-all route that sends back a message in JSON format.
app.get("/", (req, res) =>
  res.status(200).send({
    message: "These are not the pages you are looking for... :)"
  })
);

let port = process.env.PORT || 4848;

models.sequelize.sync().then(() => app.listen(port));

module.exports = app;
