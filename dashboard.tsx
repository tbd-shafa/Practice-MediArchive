import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { MeService } from "../services/MeService";
import config from "../config";
import Image from "next/image";
import { patientService, Patient } from "../services/patientService";
import { toast, ToastContainer } from "react-toastify";
import { api } from "../services/api";

interface UserPackage {
  package_type: string;
  slug: string;
  name: string;
  id: number;
  subscription_plan_id: number;
  status: string;
}
interface UserData {
  id: number;
  name: string;

  package: UserPackage;
  has_activate_paid_subscription: boolean;
}
const Dashboard: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientIdToDelete, setPatientIdToDelete] = useState<number | null>(
    null
  );
  const [patientNameToDelete, setPatientNameToDelete] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");
  const handleClick = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleEditClick = (patientId: number) => {
    router.push(`/edit-patient/${patientId}`);
  };

  const handleDeletePatient = async (patientId: number) => {
    try {
      const response = await patientService.deletePatient(patientId);
      if (response.status === "success") {
        toast.success("Patient deleted successfully", { autoClose: 1000 });
        // Update the local state immediately
        setPatients((prevPatients) =>
          prevPatients.filter((patient) => patient.id !== patientId)
        );
      } else {
        toast.error("Failed to delete", { autoClose: 1000 });
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("An error occurred while deleting the patient", {
        autoClose: 1000,
      });
    }
  };
  const handleDeleteClick = (id: number, name: string) => {
    setPatientIdToDelete(id);
    setPatientNameToDelete(name);
  };

  const handleConfirmDelete = () => {
    if (patientIdToDelete !== null) {
      handleDeletePatient(patientIdToDelete);
      setPatientIdToDelete(null);
      setPatientNameToDelete(null);
    }
  };

  useEffect(() => {
    // Check authentication
    const authData = localStorage.getItem(config.TOKEN_STORAGE_KEY);
    if (!authData) {
      router.push("/");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);
  const [isModalOpenForUpgrade, setIsModalOpenForUpgrade] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get<{ status: string; data: UserData }>(
          config.API_ENDPOINTS.CLIENT_PROFILE
        );

        if (response.status === "success") {
          setUserData(response.data);
        }
      } catch (err) {
        setError("Failed to load user profile");
        console.error("Error fetching user profile:", err);
      } finally {
      }
    };

    fetchUserProfile();
  }, []);

  const handlePlusClick = async () => {
    try {
      const response = await MeService.getMeInfo();
      const profileLimit = response.data.package.values.profile.limit;
      const profileUsed = response.data.package.values.profile.used;

      console.log(profileLimit, profileUsed);

      if (profileLimit !== "Unlimited" && Number(profileLimit) <= profileUsed) {
        setIsModalOpenForUpgrade(true);
      } else {
        router.push("/add-patient");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await patientService.getPatients();
        if (response.status === "success") {
          setPatients(response.data.patient_list);
        } else {
          toast.error("Failed to fetch patients");
        }
      } catch (error) {
        toast.error("Error loading patients");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        className="min-vh-100 d-flex flex-column"
        style={{ backgroundColor: "#F2F5F8" }}
      >
        <Head>
          <title>Dashboard - MediArchive</title>
          <link rel="icon" href="images/favicon.ico" />
        </Head>

        <Header />
        <main className="flex-grow-1 py-3">
          <div className="container">
            <div className="app-container ">
              <div className="app-card max-width-761px p-2 app-card-height">
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column patient-db-full-area"
      style={{ backgroundColor: "#F2F5F8" }}
    >
      <Head>
        <title>Dashboard - MediArchive</title>
        <link rel="icon" href="images/favicon.ico" />
      </Head>

      <Header />

      <main className="flex-grow-1 pt-3">
        <div className="container">
          <ToastContainer />
          {patients.length === 0 ? (
            <div className="empty-dashboard">
              <img
                className="empty-icon"
                src="/images/empty-heart-icon.svg"
                alt="logo"
              />
              <p>
                Please add a patient profile first <br />
                to start adding all the medical records.
              </p>
              <Link href="/add-patient">
                <button className="btn btn-patient-left-icon">
                  Add Patient Profile
                </button>
              </Link>
              <Link href="" className="mt-5 learn-video">
                <img src="/images/youtube-paly.svg" alt="" /> Learn How
              </Link>
            </div>
          ) : (
            <div className="app-container">
              <div className="app-card max-width-761px p-2 app-card-height">
                <div className="patient-list">
                  {patients.map((patient, index) => (
                    <div key={patient.id} className="patient-item">
                      <div className="patient-card">
                        <div className="patient-item-image">
                          <Link
                            href={`/view-patient/${patient.name.toLowerCase().replace(/ /g, '-')}`}
                            onClick={() => {
                              localStorage.setItem('current_patient_id', patient.id.toString());
                              localStorage.setItem('current_patient_name', patient.name.toLowerCase().replace(/ /g, '-'));
                            }}
                          >
                            <div
                              style={{
                                position: "relative",
                                width: "100%",
                                height: "300px", // Ensure a fixed height for consistency
                              }}
                            >
                              {/* Loading Placeholder */}
                              {patient.profile_picture ? (
                                <>
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      width: "100%",
                                      height: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      backgroundColor: "#f8f9fa",
                                      borderRadius: "8px",
                                      zIndex: 1,
                                    }}
                                  >
                                    <div
                                      className="spinner-border text-primary"
                                      style={{ width: "2rem", height: "2rem" }}
                                      role="status"
                                    >
                                      <span className="visually-hidden">
                                        Loading...
                                      </span>
                                    </div>
                                  </div>

                                  <img
                                    src={patient.profile_picture}
                                    alt={patient.name}
                                    width={300}
                                    height={300}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "contain",
                                      borderRadius: "8px",
                                      position: "relative",
                                      zIndex: 2,
                                    }}
                                    onLoad={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.zIndex = "2"; // Hide loader when image loads
                                    }}
                                    onError={(e) => {
                                      // Handle image load error by showing the placeholder
                                      e.currentTarget.src =
                                        "/images/placeholder-patient.svg";
                                    }}
                                  />
                                </>
                              ) : (
                                <Image
                                  src="/images/placeholder-patient.svg"
                                  alt="User"
                                  width={80}
                                  height={80}
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                  }}
                                />
                              )}
                            </div>
                          </Link>
                        </div>
                        <div className="patient-item-details-card">
                          <div className="patient-item-details">
                            <div className="patient-item-name-date">
                              <div className="patient-item-name">
                                {patient.name}
                              </div>
                              <div className="patient-item-date">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="13.333"
                                  height="13.334"
                                  viewBox="0 0 13.333 13.334"
                                >
                                  <path
                                    id="Icon_material-update"
                                    data-name="Icon material-update"
                                    d="M17.835,9.774H12.813l2.03-2.089a5.214,5.214,0,0,0-7.319-.074,5.093,5.093,0,0,0,0,7.252,5.2,5.2,0,0,0,7.319,0,4.825,4.825,0,0,0,1.511-3.622h1.482a6.92,6.92,0,0,1-1.956,4.66,6.707,6.707,0,0,1-9.423,0,6.548,6.548,0,0,1-.015-9.319,6.658,6.658,0,0,1,9.371,0L17.835,4.5Zm-6.3-1.57v3.148l2.593,1.541-.533.9-3.171-1.882V8.2Z"
                                    transform="translate(-4.502 -4.5)"
                                    fill="#a8aaaa"
                                  />
                                </svg>

                                {new Intl.DateTimeFormat("en-US", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }).format(new Date(patient.dob))}
                              </div>
                            </div>
                            <button
                              className="actin-btn"
                              onClick={() => handleClick(index)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 128 512"
                                fill="#a8aaaa"
                                width="6"
                              >
                                <path
                                  fill="#a8aaaa"
                                  d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div
                          className={`action-card ${
                            activeIndex === index ? "active" : ""
                          }`}
                        >
                          <div className="action-item">
                            <button onClick={() => handleEditClick(patient.id)}>
                              <span className="edit-icon"> </span>Edit Patient
                            </button>
                          </div>
                          <div className="action-item">
                            <button
                              data-bs-toggle="modal"
                              data-bs-target="#exampleModal"
                              onClick={() =>
                                handleDeleteClick(patient.id, patient.name)
                              }
                            >
                              <span className="delete-icon"> </span> Delete
                              Patient
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="patient-item patient-item-add">
                    <div className="patient-card">
                      <div className="patient-item-image">
                        <Link href="">
                          <Image
                            src="/images/patient-add.svg"
                            alt="User"
                            width={140}
                            height={100}
                          />
                          <span
                            className="add-patient"
                            onClick={handlePlusClick}
                          >
                            <span className="icon plus-gray"> </span>Add Patient
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      {isModalOpenForUpgrade && (
        <div
          className="modal fade confirm-modal show"
          id="exampleModal"
          style={{ display: "block" }}
          tabIndex={-1}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Upgrade Required
                </h5>
              </div>
              <div className="modal-body pt-5 pb-3">
                <h4>
                  Your current starter package does not support this feature.
                </h4>
              </div>
              <div className="modal-footer px-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpenForUpgrade(false)} // Close the modal
                >
                  Cancel
                </button>
                <Link
                  href="/subscriptions"
                  className="btn btn-link text-primary fw-bold text-center d-block"
                >
                  UPGRADE NOW
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* - Modal   */}
      <div
        className="modal fade  confirm-modal patient_remove_cm"
        id="exampleModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Confirm Deletion
              </h5>
            </div>
            <div className="modal-body  pt-5 pb-3">
              <h4>
                Are you sure you <br /> want to Delete Patient
              </h4>
              <h2>{patientNameToDelete}</h2>
            </div>
            <div className="modal-footer px-4">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                NO KEEP THAT
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmDelete}
                data-bs-dismiss="modal"
              >
                YES DELETE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
function fetchData() {
  throw new Error("Function not implemented.");
}
