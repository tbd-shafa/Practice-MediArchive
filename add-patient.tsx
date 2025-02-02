import * as yup from "yup";
import axios from "axios";
import { api } from "../services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faFileAlt,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import config from "../config";

// TypeScript interfaces
interface PatientFormData {
  name: string;
  gender: string;
  blood_group: string;
  dob: string;
  profile_picture?: File;
}

interface FormErrors {
  name?: string;
  gender?: string;
  blood_group?: string;
  dob?: string;
  profile_picture?: string;
}

interface ApiResponse {
  status: string;
  type: string;
  status_code: number;
  message: string;
  data: {
    status: string;
    id: number;
    name: string;
    gender: string;
    dob: string;
    blood_group: string;
    blood_group_label: string;
    created_at: string;
    updated_at: string | null;
    last_activity: string;
    profile_picture: File;
  };
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  gender: yup
    .string()
    .required("Gender is required")
    .oneOf(["Male", "Female", "Other"], "Required gender"),
  blood_group: yup
    .string()
    .required("Blood group is required")
    .oneOf(BLOOD_GROUPS, "Invalid blood group"),
  dob: yup.string().required("Date of birth is required"),
  
});

const AddPatientPage = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authData = localStorage.getItem(config.TOKEN_STORAGE_KEY);
      if (!authData) {
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);

  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    gender: "",
    blood_group: "",
    dob: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectGender = (selectedGender: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: selectedGender,
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        setIsUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setFormData(prev => ({
        ...prev,
        dob: date.toISOString().split('T')[0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});

    try {
      // Validate form data
      await validationSchema.validate(formData, { abortEarly: false });

      // Create FormData object instead of URLSearchParams
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("dob", formData.dob);
      formDataToSend.append("blood_group", formData.blood_group);
      if (photoFile) {
        formDataToSend.append("profile_picture", photoFile);
      }

      const response = await api.post<ApiResponse>(
        config.API_ENDPOINTS.ADD_PATIENT,
        formDataToSend,
        {
          requiresAuth: true
        }
      );

      if (response.status === "success") {
        // Reset form
        setFormData({
          name: "",
          gender: "",
          blood_group: "",
          dob: "",
        });
        setPhoto(null);
        setPhotoFile(null);
        setIsUploaded(false);

        toast.success("Patient added successfully!", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Redirect after toast
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        toast.error(response.message || "Failed to add patient. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: FormErrors = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path as keyof FormErrors] = err.message;
          }
        });
        setFormErrors(errors);
      } else {
        // Handle API errors
        const apiError = error as any;
        toast.error(apiError?.message || "Failed to add patient. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ backgroundColor: "#F2F5F8" }}
    >
      <Head>
        <title>Add Patient - MediArchive</title>
      </Head>

      <Header />
      
      <main className="flex-grow-1 py-3">
        <div className="container">
         
          
        <div className="app-container">
      <ToastContainer />
      <h2>Add Patient Profile</h2>
      <div className="app-card">
        <div className="add-patient-profile">
          <div className="registration-form">
          <div className="photo-upload">
                <div
                  className="photo-placeholder"
                  onClick={() =>
                    document.getElementById("upload-photo").click()
                  }
                >
                  <img
                    src={photo || "/images/placeholder.svg"}
                    alt="Patient photo"
                    id="patient-photo"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id="upload-photo"
                    name="profile_picture"
                    style={{ display: "none" }}
                    onChange={handlePhotoUpload}
                  />
                  {!isUploaded ? (
                    <button className="add-photo-btn">Add Patient Photo</button>
                  ) : (
                    <div className="edit-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="36"
                        height="36"
                        viewBox="0 0 36 36"
                      >
                        <g
                          id="Group_875"
                          data-name="Group 875"
                          transform="translate(-1146 1013)"
                        >
                          <circle
                            id="Ellipse_13"
                            data-name="Ellipse 13"
                            cx="18"
                            cy="18"
                            r="18"
                            transform="translate(1146 -1013)"
                            fill="#1a72e8"
                          />
                          <g
                            id="Icon_feather-edit-3"
                            data-name="Icon feather-edit-3"
                            transform="translate(1151 -1007.818)"
                          >
                            <path
                              id="Path_9"
                              data-name="Path 9"
                              d="M26.5,30.5h-9a1,1,0,1,1,0-2h9a1,1,0,0,1,0,2Z"
                              transform="translate(-4.5 -8.561)"
                              fill="#fff"
                            />
                            <path
                              id="Path_10"
                              data-name="Path 10"
                              d="M19,2.818a3.121,3.121,0,0,1,2.207,5.328l-12.5,12.5a1,1,0,0,1-.465.263l-4,1A1,1,0,0,1,3.03,20.7l1-4a1,1,0,0,1,.263-.465l12.5-12.5A3.1,3.1,0,0,1,19,2.818ZM7.489,19.036l12.3-12.3a1.121,1.121,0,1,0-1.586-1.586L5.9,17.451l-.529,2.114Z"
                              fill="#fff"
                            />
                          </g>
                        </g>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            <form
              id="patient-form"
              className="patient-form"
              onSubmit={handleSubmit}
            >
              
              <div className="mb-3 mt-3">
                <input
                  className={`form-control ${
                    formErrors.name ? "is-invalid" : ""
                  }`}
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Patient Name"
                />
                {formErrors.name && (
                  <div className="invalid-feedback">{formErrors.name}</div>
                )}
              </div>
              <div className="select-cender mb-3">
                <label>Gender</label>
                <div className="custom-redio-group">
                  <div
                    onClick={() => handleSelectGender("Male")}
                    className={`custom-radio ${
                      formData.gender === "Male" ? "active" : ""
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18.578"
                      height="26.849"
                      viewBox="0 0 18.578 26.849"
                    >
                      <path
                        id="Path_1310"
                        data-name="Path 1310"
                        d="M-1274.849,266.572h0a5.984,5.984,0,0,0-5.456,3.536,5.932,5.932,0,0,0-.127,4.569,5.933,5.933,0,0,0,3.141,3.321,6.013,6.013,0,0,0,1.305.414l1.064.207,1.073-.185a5.971,5.971,0,0,0,4.448-3.449,5.979,5.979,0,0,0-3.013-7.89,5.926,5.926,0,0,0-2.434-.523m0-3.315a9.257,9.257,0,0,1,3.787.812,9.287,9.287,0,0,1,4.686,12.269,9.278,9.278,0,0,1-6.912,5.363c-.033.583-.019,1.169-.034,1.753.661.009,1.323.012,1.985.027a1.661,1.661,0,0,1,1.031.368,1.674,1.674,0,0,1,.6,1.484,1.658,1.658,0,0,1-1.128,1.377,2.5,2.5,0,0,1-.871.084c-.554-.006-1.107-.015-1.66-.014-.01.557-.014,1.116-.021,1.673a1.684,1.684,0,0,1-.66,1.319,1.667,1.667,0,0,1-2.175-.149,1.674,1.674,0,0,1-.484-1.232c.008-.551.005-1.1.028-1.652-.673-.023-1.346-.009-2.019-.034a1.675,1.675,0,0,1-1.1-.443,1.638,1.638,0,0,1-.509-1.432,1.667,1.667,0,0,1,1.147-1.363,3.233,3.233,0,0,1,1.021-.073h.024c.481.008.964,0,1.445.027.043-.583.021-1.171.041-1.756a9.315,9.315,0,0,1-2.026-.642,9.287,9.287,0,0,1-4.686-12.269A9.288,9.288,0,0,1-1274.848,263.257Z"
                        transform="translate(1284.142 -263.257)"
                        fill={
                          formData.gender === "Male" ? "#1A72E8" : "#a8aaaa"
                        }
                      />
                    </svg>

                    <span>Male</span>
                  </div>

                  <div
                    onClick={() => handleSelectGender("Female")}
                    className={`custom-radio ${
                      formData.gender === "Female" ? "active" : ""
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="26.038"
                      height="25.877"
                      viewBox="0 0 26.038 25.877"
                    >
                      <path
                        id="Path_1307"
                        data-name="Path 1307"
                        d="M-1311.212-96.924a6.7,6.7,0,0,0-6.047,3.76,6.689,6.689,0,0,0-.335,5.143,6.689,6.689,0,0,0,3.4,3.873,6.661,6.661,0,0,0,2.968.7,6.7,6.7,0,0,0,6.048-3.76,6.761,6.761,0,0,0-.449-6.731l-.678-1.013-.994-.709a6.831,6.831,0,0,0-.943-.564,6.666,6.666,0,0,0-2.969-.7m8.028-8.52h.043q2.336.028,4.671.063a4.288,4.288,0,0,1,1.476.155,1.881,1.881,0,0,1,1.192,1.772c-.016,1.721-.047,3.442-.068,5.163a5.822,5.822,0,0,1-.064.995,1.9,1.9,0,0,1-.841,1.191,1.911,1.911,0,0,1-1.846.09,1.928,1.928,0,0,1-1.011-1.292,13.559,13.559,0,0,1-.051-1.393l-.049,0q-1.342,1.288-2.668,2.592a10.615,10.615,0,0,1,.706,10.609,10.619,10.619,0,0,1-14.218,4.832,10.618,10.618,0,0,1-4.832-14.218,10.618,10.618,0,0,1,9.533-5.928,10.58,10.58,0,0,1,4.685,1.1,10.7,10.7,0,0,1,1.481.885c.933-.942,1.917-1.833,2.838-2.786a5.02,5.02,0,0,1-1.785-.227,1.9,1.9,0,0,1-.977-2.275A1.908,1.908,0,0,1-1303.184-105.443Z"
                        transform="translate(1321.84 105.443)"
                        fill={
                          formData.gender === "Female" ? "#1A72E8" : "#a8aaaa"
                        }
                      />
                    </svg>

                    <span>Female</span>
                  </div>

                  <div
                    onClick={() => handleSelectGender("Other")}
                    className={`custom-radio ${
                      formData.gender === "Other" ? "active" : ""
                    }`}
                  >
                    <svg
                      id="Group_773"
                      data-name="Group 773"
                      xmlns="http://www.w3.org/2000/svg"
                      width="26.31"
                      height="25.132"
                      viewBox="0 0 26.31 25.132"
                    >
                      <path
                        id="Path_1308"
                        data-name="Path 1308"
                        d="M-923.465-112.51a8.94,8.94,0,0,0,2.439-.121,10.074,10.074,0,0,1-2.687-3.439c-.04-.1-.1-.2-.225-.21a5.093,5.093,0,0,1-3.558-3.27,5.074,5.074,0,0,1-.1-3.033,5.074,5.074,0,0,1,1.975-2.811,5.055,5.055,0,0,1,2.98-.941,5.089,5.089,0,0,1,3.317,1.25,5.131,5.131,0,0,1,1.756,3.589,5.269,5.269,0,0,1-.534,2.575,5.545,5.545,0,0,0,.339.607,3.767,3.767,0,0,0,2.59,1.626c.175-.386.415-.741.554-1.143a6.835,6.835,0,0,0,.377-1.071,8.73,8.73,0,0,0-1.064-7.027,8.724,8.724,0,0,0-4.912-3.69,8.685,8.685,0,0,0-4.95.012,8.788,8.788,0,0,0-4.913,3.733,8.747,8.747,0,0,0-1.336,4.645,8.785,8.785,0,0,0,.012,4.95,8.724,8.724,0,0,0,3.69,4.912,8.73,8.73,0,0,0,7.027,1.064,6.835,6.835,0,0,0,1.071-.377c.4-.139.757-.379,1.143-.554a3.767,3.767,0,0,0-1.626-2.59,5.545,5.545,0,0,0-.607-.339,5.269,5.269,0,0,1-2.575.534,5.131,5.131,0,0,1-3.589-1.756,5.089,5.089,0,0,1-1.25-3.317,5.055,5.055,0,0,1,.941-2.98,5.074,5.074,0,0,1,2.811-1.975,5.074,5.074,0,0,1,3.033.1,5.093,5.093,0,0,1,3.27,3.558c.01.125.11.185.21.225a10.074,10.074,0,0,1,3.439,2.687A8.94,8.94,0,0,0-923.465-112.51Z"
                        transform="translate(936.465 137.642)"
                        fill={
                          formData.gender === "Other" ? "#1A72E8" : "#a8aaaa"
                        }
                      />
                    </svg>
                    <span>Other</span>
                  </div>
                </div>
                {formErrors.gender && (
                  <div className="invalid-feedback d-block">
                    {formErrors.gender}
                  </div>
                )}
              </div>
              <div className="form-row mb-5">
                <div className="form-group">
                  <label>Blood Group</label>
                  <select
                    className={`form-control ${
                      formErrors.blood_group ? "is-invalid" : ""
                    }`}
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                  {formErrors.blood_group && (
                    <div className="invalid-feedback">
                      {formErrors.blood_group}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Date Of Birth</label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    className={`form-control ${
                      formErrors.dob ? "is-invalid" : ""
                    }`}
                    dateFormat="dd MMMM yyyy"
                    maxDate={new Date()}
                    placeholderText="Select Date of Birth"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                  />
                  {formErrors.dob && (
                    <div className="invalid-feedback">{formErrors.dob}</div>
                  )}
                </div>
              </div>

              <div className="form-row justify-content-center mb-3 ">
                <button
                  type="submit"
                  className="btn btn-patient-add"
                  disabled={loading}
                >
                  {loading ? "Adding Patient..." : "ADD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddPatientPage;