import React, { useState, useEffect } from "react";
import "../styles/bookappointment.css";
import axios from "axios";
import toast from "react-hot-toast";
import fetchData from "../helper/apiCall";
import { IoMdClose } from "react-icons/io";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css"; // Import flatpickr styles

const BookAppointment = ({ setModalOpen, ele }) => {
  const [formDetails, setFormDetails] = useState({
    date: "",
    time: "",
  });
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const getAllAppoint = async (e) => {
      try {
        const temp = await fetchData(
          `/appointment/getallappointments?search=${ele?.userId?._id}`
        );
        setBookedAppointments(temp);
        
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    getAllAppoint();
  }, [ele?.userId?._id]);

  useEffect(()=>{
    const todayDateString = new Date().toISOString().split("T")[0];
    if (bookedAppointments.some((appointment) => appointment.date === todayDateString)) {
      let nextDate = new Date();
      do {
        nextDate.setDate(nextDate.getDate() + 1);
      } while (bookedAppointments.some((appointment) => appointment.date === nextDate.toISOString().split("T")[0]));
      // Update the formDetails.date value with the next date
      setFormDetails({
        ...formDetails,
        date: nextDate.toISOString().split("T")[0],
      });
    }
  },[bookedAppointments])

  useEffect(() => {
    flatpickr("#date-input", {
      minDate: "today",
      dateFormat: "Y-m-d", // Specify the date format
    });
  }, []);

  const [today, setToday] = useState(
    {
      date: "",
      time: ""
    }
  );

  // Set the minimum date to today's date
  useEffect(() => {
    const today = new Date();
    const todayISOString = today.toISOString();
    const currentHour = today.getHours() + 2;
    const currentMinute = 0;
    const currentTimeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
    setToday({
      ...today,
      date: todayISOString.split("T")[0],
      time: currentTimeString,
    });
    setFormDetails({
      ...formDetails,
      date: todayISOString.split("T")[0],
      time: currentTimeString,
    });
  }, []);

  const inputChange = (e) => {
    const { name, value } = e.target;
    console.log(value);
    return setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const bookAppointment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await toast.promise(
        axios.post(
          "/appointment/bookappointment",
          {
            doctorId: ele?.userId?._id,
            date: formDetails.date,
            time: formDetails.time,
            doctorname: `${ele?.userId?.firstname} ${ele?.userId?.lastname}`,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Appointment booked successfully",
          error: "Unable to book appointment",
          loading: "Booking appointment...",
        }
      );
      setModalOpen(false);
    } catch (error) {
      return error;
    }
  };

  

  return (
    <>
      <div className="modal flex-center">
        <div className="modal__content">
          <h2 className="page-heading">Book Appointment</h2>
          <IoMdClose
            onClick={() => {
              setModalOpen(false);
            }}
            className="close-btn"
          />
          <div className="register-container flex-center book">
            {isLoading ? ( // Show loading message or spinner while data is being fetched
              <p>Loading...</p>
            ) : (
              <form className="register-form">
                {/* <input
                  type="date"
                  name="date"
                  className="form-input"
                  value={formDetails.date}
                  onChange={inputChange}
                  min={today.date}
                  disabled={bookedAppointments.some(
                    (appointment) => appointment.date == formDetails.date)}
                /> */}
                <input
                  type="text"
                  id="date-input"
                  className="form-input"
                  value={formDetails.date}
                  placeholder="Select a date"
                  onChange={inputChange}
                  onFocus={() => {
                    flatpickr("#date-input", {
                      minDate: "today",
                      dateFormat: "Y-m-d",
                      disable: bookedAppointments.map((appointment) => appointment.date),
                      onDayCreate: function (dObj, dStr, fp, dayElem) {
                        // Check if the date is disabled
                        const dateString = dStr.split("T")[0];
                        if (
                          bookedAppointments.some((appointment) => appointment.date === dateString)
                        ) {
                          dayElem.classList.add("disabled-date"); // Apply the custom CSS class
                        }
                      },
                    });
                    
                  }}
                />

                <input
                  type="time"
                  name="time"
                  className="form-input"
                  value={formDetails.time}
                  onChange={inputChange}
                  min={today.time === new Date().toISOString().split("T")[0] ? today.time : ""}
                />
                <button
                  type="submit"
                  className="btn form-btn"
                  onClick={bookAppointment}
                >
                  book
                </button>

              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookAppointment;
