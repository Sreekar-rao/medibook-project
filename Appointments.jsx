import React, { useEffect, useState } from "react";
import Empty from "../components/Empty";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import fetchData from "../helper/apiCall";
import { setLoading } from "../redux/reducers/rootSlice";
import Loading from "../components/Loading";
import { useDispatch, useSelector } from "react-redux";
import jwt_decode from "jwt-decode";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/user.css";


const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);
  const { userId } = jwt_decode(localStorage.getItem("token"));

  const getAllAppoint = async (e) => {
    try {
      dispatch(setLoading(true));
      const temp = await fetchData(
        `/appointment/getallappointments?search=${userId}`
      );
      setAppointments(temp.reverse());
      dispatch(setLoading(false));
    } catch (error) {}
  };

  useEffect(() => {
    getAllAppoint();
  }, []);

  const complete = async (ele) => {
    try {
      const { data } = await toast.promise(
        axios.put(
          "/appointment/completed",
          {
            appointid: ele?._id,
            doctorId: ele?.doctorId?._id,
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

      getAllAppoint();
    } catch (error) {
      return error;
    }
  };

  const accept= async (ele)=>{
    try {
      const { data } = await toast.promise(
        axios.post(
          "/appointment/acceptappointment",
          {
            appointid: ele?._id,
            doctorId: ele?.doctorId._id,
            userId:ele?.userId._id,
            doctorname: `${ele?.userId?.firstname} ${ele?.userId?.lastname}`,
            date: ele?.date,
            time: ele?.time,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Appointment accepted successfully",
          error: "Unable to accept appointment",
          loading: "Accepting appointment...",
        }
      );

      getAllAppoint();
    } catch (error) {
      return error;
    }
  }

  const reject = async (ele) => {
    try {
      const { data } = await toast.promise(
        axios.post(
          "/appointment/doctorreject",
          {
            appointid: ele?._id,
            doctorId: ele?.doctorId._id,
            userId:ele?.userId._id,
            doctorname: `${ele?.userId?.firstname} ${ele?.userId?.lastname}`,
            date: ele?.date,
            time: ele?.time,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Appointment Rejected successfully",
          error: "Unable to reject appointment",
          loading: "Rejecting appointment...",
        }
      );

      getAllAppoint();
    } catch (error) {
      return error;
    }
  };


  return (
    <>
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <section className="container notif-section">
          <h2 className="page-heading">Your Appointments</h2>

          {appointments.length > 0 ? (
            <div className="appointments">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Doctor</th>
                    <th>Patient</th>
                    <th>Appointment Date</th>
                    <th>Appointment Time</th>
                    <th>Booking Date</th>
                    <th>Booking Time</th>
                    <th>Status</th>
                    {userId === appointments[0].doctorId?._id ? (
                      <th>Action</th>
                    ) : (
                      <></>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {appointments?.map((ele, i) => {
                      return (
                        <tr key={ele?._id}>
                        <td>{i + 1}</td>
                        <td>
                          {ele?.doctorId?.firstname + " " + ele?.doctorId?.lastname}
                        </td>
                        <td>
                          {ele?.userId?.firstname + " " + ele?.userId?.lastname}
                        </td>
                        <td>{ele?.date}</td>
                        <td>{ele?.time}</td>
                        <td>{ele?.createdAt.split("T")[0]}</td>
                        <td>{ele?.updatedAt.split("T")[1].split(".")[0]}</td>
                        <td>{ele?.status}</td>
                        {userId === ele?.doctorId?._id ? (
                          <td>
                             <button
                            className={`accept-btn ${
                              ( ele?.status=== 'Completed' || ele?.status=="Rejected"  )  ? "disable-btn" : ""
                            }`}
                            disabled={ele?.status=== 'Completed' || ele?.status=="Rejected" }
                            onClick={() => accept(ele)}
                          >
                            Accept
                          </button>
                          <button
                            className={`user-btn  ${
                              (ele?.isRejected || ele?.status=== 'Completed' || ele?.status=="Rejected")? "disable-btn" : ""
                            }`}
                            disabled={ele?.isRejected || ele?.status=== 'Completed' || ele?.status=="Rejected" }
                            onClick={() => reject(ele)}
                          >
                            Reject
                          </button>
                            <button
                              className={`user-btn complete-btn ${
                                ele?.status === "Completed" || ele?.status=="Rejected"  ? "disable-btn" : ""
                              }`}
                              disabled={ele?.status === "Completed" || ele?.status=="Rejected" }
                              onClick={() => complete(ele)}
                            >
                              Complete
                            </button>
                          </td>
                        ) : (
                          <></>
                        )}
                      </tr>
                    );
                  }
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty />
          )}
        </section>
      )}
      <Footer />
    </>
  );
};
export default Appointments;
