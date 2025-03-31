const express = require("express");
const auth = require("../middleware/auth");
const appointmentController = require("../controllers/appointmentController");

const appointRouter = express.Router();

appointRouter.get(
  "/getallappointments",
  auth,
  appointmentController.getallappointments
);

appointRouter.post(
  "/bookappointment",
  auth,
  appointmentController.bookappointment
);
appointRouter.post(
  "/acceptappointment",
    appointmentController.acceptappointment
);
appointRouter.post(
  "/rejectappointment",
    appointmentController.rejectappointment
);
appointRouter.post(
  "/doctorreject",
    appointmentController.doctorreject
);

appointRouter.put("/completed", auth, appointmentController.completed);

module.exports = appointRouter;
