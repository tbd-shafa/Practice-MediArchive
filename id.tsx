import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import config from "../../config";

import { patientService, Patient } from "../../services/patientService";

const BloodPressure = dynamic(() => import("./blood-pressure"), {
  ssr: false,
});

const BloodPressureAdd = dynamic(() => import("./blood-pressure/add"), {
  ssr: false,
});
const GlucoseAdd = dynamic(() => import("./glucose/add"), {
  ssr: false,
});
const PrescriptionAdd = dynamic(() => import("./prescription/add"), {
  ssr: false,
});

const PrescriptionEdit = dynamic(() => import("./prescription/edit"), {
  ssr: false,
});

const LabReportAdd = dynamic(() => import("./labreport/add"), {
  ssr: false,
});

const LabReportEdit = dynamic(() => import("./labreport/edit"), {
  ssr: false,
});

const LabReportEditTags = dynamic(() => import("./labreport/edit-tags"), {
  ssr: false,
});

const LabReportEditAttachment = dynamic(
  () => import("./labreport/edit-attachment"),
  {
    ssr: false,
  }
);

const LabReportAddAttachment = dynamic(
  () => import("./labreport/add-attachment"),
  {
    ssr: false,
  }
);

const LabReportAddTags = dynamic(() => import("./labreport/add-tags"), {
  ssr: false,
});

const LabReportAddImagePropsAttachment = dynamic(
  () => import("./labreport/add-image-attachment"),
  {
    ssr: false,
  }
);

const MedicineAdd = dynamic(() => import("./medicine/add"), {
  ssr: false,
});

const NotesAdd = dynamic(() => import("./notes/add"), {
  ssr: false,
});

const Glucose = dynamic(() => import("./glucose"), {
  ssr: false,
});

const LabReport = dynamic(() => import("./labreport"), {
  ssr: false,
});

const Medicine = dynamic(() => import("./medicine"), {
  ssr: false,
});

const MedicineView = dynamic(() => import("./medicine/view"), {
  ssr: false,
});

const MedicineReminder = dynamic(() => import("./medicine/medecine-reminder"), {
  ssr: false,
});

const Notes = dynamic(() => import("./notes"), {
  ssr: false,
});

const Prescription = dynamic(() => import("./prescription"), {
  ssr: false,
});

const PrescriptionAddAttachment = dynamic(
  () => import("./prescription/add-attachment"),
  {
    ssr: false,
  }
);

const PrescriptionAddTags = dynamic(() => import("./prescription/add-tags"), {
  ssr: false,
});

const PrescriptionAddImageAttachment = dynamic(
  () => import("./prescription/add-image-attachment"),
  {
    ssr: false,
  }
);

const PrescriptionEditAttachment = dynamic(
  () => import("./prescription/edit-attachment"),
  {
    ssr: false,
  }
);

const PrescriptionEditTags = dynamic(() => import("./prescription/edit-tags"), {
  ssr: false,
});

const NoteView = dynamic(() => import("./notes/view"), {
  ssr: false,
});

const PatientView: NextPage = () => {
  const router = useRouter();
  const { id, view, tab } = router.query;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState("blood-pressure");
  useEffect(() => {
    const checkAuth = () => {
      const authData = localStorage.getItem(config.TOKEN_STORAGE_KEY);
      if (!authData) {
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);
  useEffect(() => {
    const fetchPatient = async () => {
      if (id) {
        try {
          const response = await patientService.getPatientById(Number(id));
          if (response.status === "success") {
            setPatient(response.data);
          }
        } catch (error) {
          console.error("Error fetching patient:", error);
        }
      }
    };

    fetchPatient();
  }, [id]);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    // When changing tabs, remove the 'view=add' parameter
    router.push(
      {
        pathname: `/view-patient/${id}`,
        query: { tab: tabName },
      },
      undefined,
      { shallow: true }
    );
  };

  useEffect(() => {
    if (tab) {
      setActiveTab(tab as string);
    }
  }, [tab]);

 //edit lab-report route change start
const clearLabReportEditData = () => {
  localStorage.removeItem("LabReportImages");
  localStorage.removeItem("selectedTest_names");
  localStorage.removeItem("selectedDoctors");
  localStorage.removeItem("selectedDate");
  localStorage.removeItem("removedLabReportApiImages");
  localStorage.removeItem("removedLabReportTestNames");
};

useEffect(() => {
  // Check if we're navigating away from lab report edit pages
  const isLabReportEditRoute =
    view === "edit" &&
    activeTab === "lab-report" &&
    !router.query.editTags &&
    !router.query.imageAttachment &&
    router.query.labReportId;

  const isLabReportEditTagsRoute =
    view === "edit" &&
    activeTab === "lab-report" &&
    router.query.editTags === "true";

  const isLabReportEditAttachmentRoute =
    view === "edit" &&
    activeTab === "lab-report" &&
    router.query.imageAttachment === "true";

  // If not on any of the lab report edit routes, clear the data
  if (
    !(
      isLabReportEditRoute ||
      isLabReportEditTagsRoute ||
      isLabReportEditAttachmentRoute
    )
  ) {
    clearLabReportEditData();
  }
}, [router.query, view, activeTab]);
//edit lab-report route change end

// edit prescription route change start
const clearPrescriptionEditData = () => {
  localStorage.removeItem("PrescriptionImages");
  localStorage.removeItem("selectedSymptoms");
  localStorage.removeItem("selectedDoctors");
  localStorage.removeItem("selectedDate");
  localStorage.removeItem("removedPrescriptionApiImages");
  localStorage.removeItem("removedPrescriptionSymptoms");
};

useEffect(() => {
  // Check if we're in prescription edit flow
  const isPrescriptionEditRoute =
    view === "edit" &&
    activeTab === "prescription" &&
    !router.query.editTags &&
    !router.query.imageAttachment &&
    router.query.prescriptionId;

  const isPrescriptionEditTagsRoute =
    view === "edit" &&
    activeTab === "prescription" &&
    router.query.editTags === "true";

  const isPrescriptionEditAttachmentRoute =
    view === "edit" &&
    activeTab === "prescription" &&
    router.query.imageAttachment === "true";

  // Check if we're in prescription add flow
  const isPrescriptionAddRoute =
    view === "add" &&
    activeTab === "prescription" &&
    !router.query.addTags &&
    !router.query.imageAttachment;

  const isPrescriptionAddTagsRoute =
    view === "add" &&
    activeTab === "prescription" &&
    router.query.addTags === "true";

  const isPrescriptionAddAttachmentRoute =
    view === "add" &&
    activeTab === "prescription" &&
    router.query.imageAttachment === "true";

  // If not on any of the prescription edit or add routes, clear the data
  const isInPrescriptionFlow =
    isPrescriptionEditRoute ||
    isPrescriptionEditTagsRoute ||
    isPrescriptionEditAttachmentRoute ||
    isPrescriptionAddRoute ||
    isPrescriptionAddTagsRoute ||
    isPrescriptionAddAttachmentRoute;

  if (!isInPrescriptionFlow) {
    clearPrescriptionEditData();
  }
}, [router.query, view, activeTab]);
//edit prescription route change end

  const renderContent = () => {
    // Handle add views
    if (view === "add") {
      switch (activeTab) {
        case "blood-pressure":
          return <BloodPressureAdd patientId={id} />;
        case "glucose":
          return <GlucoseAdd patientId={id} />;
        case "prescription":
          if (router.query.imageAttachment === "true") {
            return <PrescriptionAddAttachment patientId={id} />;
          }

          if (router.query.addTags === "true") {
            return <PrescriptionAddTags patientId={id} />;
          }

          return <PrescriptionAdd patientId={id} />;

        case "lab-report":
          // Check if we're in image attachment mode
          if (router.query.imageAttachment === "true") {
            return <LabReportAddAttachment patientId={id} />;
          }
          if (router.query.addTags === "true") {
            return <LabReportAddTags patientId={id} />;
          }

          return <LabReportAdd patientId={id} />;
        case "medicine":
          return <MedicineAdd patientId={id} />;
        case "notes":
          return <NotesAdd patientId={id} />;
        default:
          return <BloodPressure patientId={id} />;
      }
    }
    if (view === "addimage" && activeTab === "prescription") {
      const { prescriptionId } = router.query;
      if (router.query.imageAttachment === "true") {
        return (
          <PrescriptionAddImageAttachment
            patientId={id}
            prescriptionId={prescriptionId as string}
          />
        );
      }
    }
    if (view === "addimage" && activeTab === "lab-report") {
      const { labReportId } = router.query;
      if (router.query.imageAttachment === "true") {
        return (
          <LabReportAddImagePropsAttachment
            patientId={id}
            labReportId={labReportId as string}
          />
        );
      }
    }

    if (view === "edit" && activeTab === "lab-report") {
      const { labReportId, editTags } = router.query;
      if (editTags === "true") {
        return (
          <LabReportEditTags
            patientId={id}
            labReportId={labReportId as string}
          />
        );
      }
      if (router.query.imageAttachment === "true") {
        return (
          <LabReportEditAttachment
            patientId={id}
            labReportId={labReportId as string}
          />
        );
      }
      return (
        <LabReportEdit
          patientId={id}
          labReportId={labReportId as string}
        />
      );
    }

 

    if (view === "edit" && activeTab === "prescription") {
      const { prescriptionId, editTags } = router.query;

      if (editTags === "true") {
        return (
          <PrescriptionEditTags
            patientId={id}
            prescriptionId={prescriptionId as string}
          />
        );
      }
      if (router.query.imageAttachment === "true") {
        return (
          <PrescriptionEditAttachment
            patientId={id}
            prescriptionId={prescriptionId as string}
          />
        );
      }

      return (
        <PrescriptionEdit
          patientId={id}
          prescriptionId={prescriptionId as string}
        />
      );
    }

    if (view === "view" && activeTab === "notes") {
      const { noteId } = router.query;
      return <NoteView patientId={id} noteId={noteId as string} />;
    }
    if (view === "view" && activeTab === "medicine") {
      const { medicineid } = router.query;
      return <MedicineView patientId={id} medicineId={medicineid as string} />;
    }
    if (view === "reminder" && activeTab === "medicine") {
      const { medicineid } = router.query;
      return <MedicineReminder patientId={id} medicineId={medicineid as string} />;
    }
    // Handle main views
    switch (activeTab) {
      case "blood-pressure":
        return <BloodPressure patientId={id} />;
      case "glucose":
        return <Glucose patientId={id} />;
      case "lab-report":
        return <LabReport patientId={id} />;
      case "medicine":
        return <Medicine patientId={id} />;
      case "notes":
        return <Notes patientId={id} />;
      case "prescription":
        return <Prescription patientId={id} />;
      default:
        return <BloodPressure patientId={id} />;
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ backgroundColor: "#F2F5F8" }}
    >
      <Head>
        <title>Patient- - list</title>
      </Head>

      <Header />
      <main className="flex-grow-1 py-3">
        <div className="container">
          <div className="app-container">
            <div className="max-width-761px">
              <div className="patient-view-card">
                <div className="patient-view-sidebar">
                  <div className="card border-radius-15 mb-3">
                    <div className="card-body">
                      <div className="patient-view-sidebar-header">
                        <div className="patient-view-sidebar-header-avatar">
                          <Link href="/UserProfile">
                            <div style={{ position: 'relative', width: '160px', height: '216px' }}>
                            {/* Loading Placeholder */}
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '8px',
                              zIndex: 1
                            }}>
                              <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }} role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div>

                            {patient?.profile_picture ? (
                              <img
                              src={patient.profile_picture}
                              alt={patient.name}
                              width={160}
                              height={216}
                              style={{
                                objectFit: 'cover',
                                borderRadius: '8px',
                                position: 'relative',
                                zIndex: 1
                              }}
                              onLoad={(e) => {
                                const target = e.target as HTMLImageElement;
                              }}
                            />
                            ) : (
                              <Image
                                src="/images/placeholder-patient.svg"
                                alt="User"
                                width={80}
                                height={80}
                              />
                            )}
                            <div className="patient-view-sidebar-header-avatar-icon">
                              <svg
                                id="Group_3366"
                                data-name="Group 3366"
                                xmlns="http://www.w3.org/2000/svg"
                                width="29"
                                height="23.586"
                                viewBox="0 0 29 23.586"
                              >
                                <defs>
                                  <clipPath id="clip-path">
                                    <rect
                                      id="Rectangle_952"
                                      data-name="Rectangle 952"
                                      width="29"
                                      height="23.586"
                                      fill="#1a72e8"
                                    />
                                  </clipPath>
                                </defs>
                                <g
                                  id="Group_3365"
                                  data-name="Group 3365"
                                  clip-path="url(#clip-path)"
                                >
                                  <path
                                    id="Path_4576"
                                    data-name="Path 4576"
                                    d="M63.581,11.152a.906.906,0,0,0-1.282,0l-1.172,1.172v-.53A11.8,11.8,0,0,0,49.359,0h-.013a11.733,11.733,0,0,0-9.9,5.4.906.906,0,0,0,1.524.982,9.927,9.927,0,0,1,8.38-4.57h.011a9.98,9.98,0,0,1,9.958,9.981v.531l-1.172-1.172a.906.906,0,1,0-1.282,1.282l2.719,2.719.019.017c.015.014.031.029.047.042l.037.028.034.025.042.026.034.02.043.021.038.017.042.015.042.015L60,15.39l.044.011.048.007.04.006c.03,0,.06,0,.089,0s.06,0,.089,0l.04-.006L60.4,15.4l.044-.011.042-.011.042-.015.042-.015.038-.017.043-.021.034-.02.042-.026.034-.025.037-.028c.016-.013.032-.028.047-.042l.019-.017,2.719-2.719a.906.906,0,0,0,0-1.282"
                                    transform="translate(-34.847)"
                                    fill="#1a72e8"
                                  />
                                  <path
                                    id="Path_4577"
                                    data-name="Path 4577"
                                    d="M24.133,59.589a.906.906,0,0,0-1.253.271,10.087,10.087,0,0,1-.924,1.219,9,9,0,0,0-3.354-2.93c-.245-.124-.493-.234-.744-.335a5.438,5.438,0,1,0-6.713,0,9.029,9.029,0,0,0-4.1,3.261,9.9,9.9,0,0,1-2.515-6.629v-.531L5.7,55.09a.906.906,0,0,0,1.282-1.282L4.266,51.09a.9.9,0,0,0-.067-.061l-.029-.022-.042-.031-.037-.023-.039-.023-.039-.019-.041-.019-.038-.014-.045-.016-.039-.01L3.8,50.841l-.044-.007-.043-.006c-.026,0-.053,0-.079,0h-.02c-.026,0-.053,0-.079,0l-.043.006-.044.007-.047.012-.039.01-.045.016-.039.014-.041.019-.039.019-.039.023-.037.023-.042.031-.029.022c-.023.019-.046.039-.067.061L.265,53.808A.906.906,0,0,0,1.547,55.09l1.172-1.172v.53A11.781,11.781,0,0,0,14.487,66.242H14.5a11.733,11.733,0,0,0,9.9-5.4.906.906,0,0,0-.271-1.253M14.5,49.917a3.625,3.625,0,1,1-3.625,3.625A3.629,3.629,0,0,1,14.5,49.917m0,14.512h-.011a9.892,9.892,0,0,1-6.1-2.1,7.248,7.248,0,0,1,12.23,0A9.931,9.931,0,0,1,14.5,64.429"
                                    transform="translate(0 -42.656)"
                                    fill="#1a72e8"
                                  />
                                </g>
                              </svg>
                            </div>
                            </div>
                          </Link>
                        </div>
                        <div className="patient-view-sidebar-header-info">
                          <h5 className="card-title">
                            {patient?.name || "Loading..."}
                          </h5>
                          <p className="card-date">
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
                            {patient
                              ? new Intl.DateTimeFormat("en-US", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }).format(new Date(patient.dob))
                              : "Loading..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card border-radius-15">
                    <div className="card-body">
                      <div className="nav  nav-left flex-column nav-pills">
                        <ul>
                          

                          <li
                            className={
                              activeTab === "blood-pressure" ? "active" : ""
                            }
                          >
                            <Link
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleTabClick("blood-pressure");
                              }}
                            >
                              <span className="icon blood"></span> Blood
                              Pressure
                            </Link>
                          </li>

                          <li
                            className={activeTab === "glucose" ? "active" : ""}
                          >
                            <Link
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleTabClick("glucose");
                              }}
                            >
                              <span className="icon glucose"></span> Glucose
                            </Link>
                          </li>

                          <li
                            className={
                              activeTab === "prescription" ? "active" : ""
                            }
                          >
                            <Link
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleTabClick("prescription");
                              }}
                            >
                              <span className="icon prescription"></span>{" "}
                              Prescription
                            </Link>
                          </li>

                          <li
                            className={
                              activeTab === "lab-report" ? "active" : ""
                            }
                          >
                            <Link
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleTabClick("lab-report");
                              }}
                            >
                              <span className="icon lab-report"></span> Lab
                              Report
                            </Link>
                          </li>

                          <li
                            className={activeTab === "medicine" ? "active" : ""}
                          >
                            <Link
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleTabClick("medicine");
                              }}
                            >
                              <span className="icon medicine"></span> Medicine
                            </Link>
                          </li>

                          <li className={activeTab === "notes" ? "active" : ""}>
                            <Link
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleTabClick("notes");
                              }}
                            >
                              <span className="icon notes"></span> Notes
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="patient-view-content ">
                  <div className="card border-radius-30">
                    <div className="card-body">
                      {/* load clicked li content */}
                      {renderContent()}
                      {/* end */}
                    </div>
                  </div>
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

export default PatientView;
