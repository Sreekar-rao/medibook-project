const Appointment = require("../models/appointmentModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

const getallappointments = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
        $or: [{ userId: req.query.search }, { doctorId: req.query.search }],
      }
      : {};

    const appointments = await Appointment.find(keyword)
      .populate("doctorId")
      .populate("userId");

    // console.log(appointments);
    return res.send(appointments);
  } catch (error) {
    res.status(500).send("Unable to get apponintments");
  }
};



//Patient booking an appointment and request coming for admin
const bookappointment = async (req, res) => {
  try {
    const appointment = await Appointment({
      date: req.body.date,
      time: req.body.time,
      doctorId: req.body.doctorId,
      userId: req.locals,
    });

    const usernotification = Notification({
      userId: req.locals,
      content: `Booked an appointment with Dr. ${req.body.doctorname} on ${req.body.date} at ${req.body.time}`,
    });

    await usernotification.save();

    const result = await appointment.save();
    return res.status(201).send(result);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Unable to book appointment");
  }
};



//Accept appointment 
const acceptappointment = async (req, res) => {
  try {

    const appointment = Appointment.findById(req.body.appointid);

    const user = await User.findById(req.body.userId);
    const doctor = await User.findById(req.body.doctorId);

    if (appointment.isAccepted) return req.status(201).send("Already accepted");
    const result = await Appointment.updateOne(
      { _id: req.body.appointid },
      { $set: { isAccepted: true, isRejected: false } }
    );
    if (!result) {
      return res.status(500).send("Unable to Accept");
    }

    const usernotification = Notification({
      userId: req.body.userId,
      content: `Appointment with Dr. ${doctor.firstname} ${doctor.lastname}for ${req.body.date} at  ${req.body.time} has been accepted`,
    });

    await usernotification.save();


    const doctornotification = Notification({
      userId: req.body.doctorId,
      content: `Appointment with ${user.firstname} ${user.lastname} on ${req.body.date} at ${req.body.time}`,
    });

    await doctornotification.save();

    return res.status(201).send({ "message": "accepted appointment at admin" });
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Unable to book appointment");
  }
};

//Doctor Rejects Application 
const doctorreject = async (req, res) => {
  try {

    const appointment = Appointment.findById(req.body.appointid);
    const doctor = await User.findById(req.body.doctorId);

    if (appointment.isRejected) return req.status(201).send("Already Rejected");
    
    const result = await Appointment.updateOne(
      { _id: req.body.appointid },
      { $set: { isAccepted: false, isRejected: true,status : "Rejected" } }
    );

    if (!result) {
      return res.status(500).send("Unable to Reject");
    }

    const usernotification = Notification({
      userId: req.body.userId,
      content: `Dr. ${doctor.firstname} ${doctor.lastname} has reviewed your appointment request and cannot accommodate it at this time. Please contact us to reschedule.`,
    });

    await usernotification.save();


    return res.status(201).send("Appointment Rejected");
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Unable to book appointment");
  }
};


//Admin Rejects Application
const rejectappointment = async (req, res) => {
  try {

    const appointment = Appointment.findById(req.body.appointid);
    const doctor = await User.findById(req.body.doctorId);

    if (appointment.isRejected) return req.status(201).send("Already Rejected");
    const result = await Appointment.updateOne(
      { _id: req.body.appointid },
      { $set: { isAccepted: false, isRejected: true ,status : "Rejected"} }
    );
    if (!result) {
      return res.status(500).send("Unable to Reject");
    }

    const usernotification = Notification({
      userId: req.body.userId,
      content: `Appointment with Dr. ${doctor.firstname} ${doctor.lastname}  for ${req.body.date} at  ${req.body.time} has been Rejected`,
    });

    await usernotification.save();


    return res.status(201).send("Appointment Rejected");
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Unable to book appointment");
  }
};






const completed = async (req, res) => {
  try {
    const alreadyFound = await Appointment.findOneAndUpdate(
      { _id: req.body.appointid },
      { status: "Completed" }
    );

    const usernotification = Notification({
      userId: req.locals,
      content: `Your appointment with ${req.body.doctorname} has been completed`,
    });

    await usernotification.save();

    const user = await User.findById(req.locals);

    const doctornotification = Notification({
      userId: req.body.doctorId,
      content: `Your appointment with ${user.firstname} ${user.lastname} has been completed`,
    });

    await doctornotification.save();

    return res.status(201).send("Appointment completed");
  } catch (error) {
    res.status(500).send("Unable to complete appointment");
  }
};

module.exports = {
  getallappointments,
  bookappointment,
  completed,
  acceptappointment,
  rejectappointment,
  doctorreject
};
