import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import fetchData from "../helper/apiCall";
import "../styles/user.css";


axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  const getAllAppoint = async (e) => {
    try {
      dispatch(setLoading(true));
      const temp = await fetchData(`/appointment/getallappointments`);
      setAppointments(temp.reverse());
      dispatch(setLoading(false));
    } catch (error) {}
  };

  

  useEffect(() => {
    getAllAppoint();
  }, []);


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
          "/appointment/rejectappointment",
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
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          <h3 className="home-sub-heading">All Appointments</h3>
          {appointments.length > 0 ? (
            <div className="user-container">
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments?.map((ele, i) => {
                    return (
                      <tr key={ele?._id}>
                        <td>{i + 1}</td>
                        <td>
                          {ele?.doctorId?.firstname +
                            " " +
                            ele?.doctorId?.lastname}
                        </td>
                        <td>
                          {ele?.userId?.firstname + " " + ele?.userId?.lastname}
                        </td>
                        <td>{ele?.date}</td>
                        <td>{ele?.time}</td>
                        <td>{ele?.createdAt.split("T")[0]}</td>
                        <td>{ele?.updatedAt.split("T")[1].split(".")[0]}</td>
                        <td>{ele?.status}</td>
                        <td>
                          <button
                            className={`accept-btn ${
                              (ele?.isAccepted || ele?.status=== 'Completed' || ele?.status=="Rejected"  )  ? "disable-btn" : ""
                            }`}
                            disabled={ele?.isAccepted || ele?.status=== 'Completed' || ele?.status=="Rejected" }
                            onClick={() => accept(ele)}
                          >
                            Accept
                          </button>
                          <button
                            className={`user-btn  ${
                              (ele?.isRejected || ele?.status=== 'Completed' || ele?.status=="Rejected"  )? "disable-btn" : ""
                            }`}
                            disabled={ele?.isRejected || ele?.status=== 'Completed' || ele?.status=="Rejected" }
                            onClick={() => reject(ele)}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty />
          )}
        </section>
      )}
    </>
  );
};

export default AdminAppointments;
