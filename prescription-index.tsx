//lab-report image
 <div className="timeline-item-image" style={{ position: 'relative' }}>
                        {labReport.images.length > 0 ? (
                          <>
                            {/* Loading Placeholder */}
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '105px',
                              height: '132px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '8px'
                            }}>
                              <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }} role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div>

                              {/* Actual Image */}
                              <img
                                src={labReport.images[labReport.images.length - 1].image_url}
                                alt={labReport.doctor.name}
                                width={105}
                                height={132}
                                className="thumbnail"
                                style={{
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  position: 'relative',
                                  zIndex: 1
                                }}
                                onLoad={(e) => {
                                  // Hide loader when image loads
                                  const target = e.target as HTMLImageElement;
                                  target.style.zIndex = '2';
                                }}
                                onClick={() =>
                                  handleImageClick(
                                    labReport.images,
                                    labReport.id,
                                    labReport.images.length - 1
                                  )
                                }
                              />
                            </>
                          ) : (
                            <img
                              src="/images/placeholder-patient.svg"
                              alt="placeholder"
                              width={105}
                              height={132}
                              style={{
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                          )}
                      </div>

//lab-repor end
import { FC, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import ImageZoomModal from "../../../components/ImageZoomModal";
import {
  PrescriptionService,
  Doctor,
} from "../../../services/PrescriptionService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
interface PrescriptionProps {
  patientId: string | string[] | undefined;
}

const Prescription: FC<PrescriptionProps> = ({ patientId }) => {
  const [prescriptions, setPrescriptions] = useState<{ [key: string]: any[] }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  //const [showZoomModal, setShowZoomModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [allImages, setAllImages] = useState<string[]>([]);
  // const [selectedPrescriptionId, setSelectedPrescriptionId] =
  useState<number>(0);
  const [showSearch, setShowSearch] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<Doctor[]>([]);
  const [showDoctorsList, setShowDoctorsList] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);

  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "date" | "doctor"
  >("all");
  const [showModal, setShowModal] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState<any>(null);
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});
  // Add image loading handler
const handleImageLoad = (prescriptionId: number) => {
  setLoadingImages(prev => ({
    ...prev,
    [prescriptionId]: false
  }));
};

// Add image error handler
const handleImageError = (prescriptionId: number) => {
  setLoadingImages(prev => ({
    ...prev,
    [prescriptionId]: false
  }));
};
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        const response = await PrescriptionService.getDoctors();
        if (response.status === "success") {
          setDoctors(response.data);
          setFilteredDoctors(response.data); // Show all initially
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length === 0) {
      setFilteredDoctors(doctors);
      return;
    }

    if (query.length > 2) {
      try {
        const response = await PrescriptionService.getDoctorsForSearch(query);
        if (response.status === "success") {
          setFilteredDoctors(response.data);
        }
      } catch (error) {
        console.error("Error searching doctors:", error);
      }
    } else {
      const filtered = doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  };
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<any>(null);

 

  const selectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor); // Store selected doctor
    setPrescriptions({}); // Reset prescriptions state
    setShowSearch(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        const id =
          typeof patientId === "string"
            ? parseInt(patientId)
            : Array.isArray(patientId)
            ? parseInt(patientId[0])
            : 0;
        //const response = await PrescriptionService.getPrescriptions(id);
        // const response = await PrescriptionService.getPrescriptions(
        //   id,
        //   selectedDoctor?.id
        // );
        // const response = await PrescriptionService.getPrescriptions(
        //   id,
        //   selectedDoctor?.id,
        //   selectedFilter === "doctor"
        //     ? "doctor"
        //     : selectedFilter === "date"
        //     ? "date"
        //     : undefined
        // );
        const response = await PrescriptionService.getPrescriptions(
          id,
          selectedDoctor?.id,
          selectedFilter === "doctor"
            ? "doctor"
            : selectedFilter === "date"
            ? "date"
            : undefined,
          selectedSymptom?.id // Pass selected symptom ID here
        );

        if (response.status === "success") {
          setPrescriptions(response.data);
          // Collect all images
          const images: string[] = [];
          Object.values(response.data).forEach((monthPrescriptions) => {
            monthPrescriptions.forEach((prescription) => {
              if (prescription.images.length > 0) {
                images.push(...prescription.images.map((img) => img.image_url));
              }
            });
          });
          setAllImages(images);
        }
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [patientId, selectedDoctor, selectedFilter, selectedSymptom]); // Add selectedSymptom to dependencies
  
  const [selectedImages, setSelectedImages] = useState<{ image_url: string }[]>(
    []
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<
    number | null
  >(null);
  const [showZoomModal, setShowZoomModal] = useState(false);

  
  const handleImageClick = (
    images: { image_url: string }[],
    prescriptionId: number,
    selectedIndex: number
  ) => {
    if (images.length > 0) {
      setSelectedImages(images); // Store all images
      setSelectedImageIndex(selectedIndex); // Store the selected image index
      setSelectedPrescriptionId(prescriptionId);
      setShowZoomModal(true);
    }
  };

  return (
    <>
      <div className="patient-view-content-header lab-rpt-header">
        <h5 className="card-title">
          <span className="icon blood"> </span> Prescription
        </h5>
        <div className="right-search-filter-area">
          <div className="search-area">
            <div className={`search-input-area ${showSearch ? "" : "d-none"}`}>

            {selectedDoctor ? (
              <input
                type="text"
                placeholder="Search"
                value={selectedDoctor.name}
                onChange={(e) => handleSearch(e.target.value)}
              />
            ) : (
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            )}

              {/* Selected Doctors */}
              {/* {selectedDoctor && (
                <div className="selected-doctor">
                  {selectedDoctor.name}
                  <FontAwesomeIcon
                    icon={faTimes}
                    onClick={() => setSelectedDoctor(null)}
                  />
                </div>
              )} */}

              {selectedDoctor ? (
                <span
                  className="close-icon"
                  id="close-src"
                  onClick={() => setSelectedDoctor(null)}
                >
                  <Image
                    src="/images/close-icon.svg"
                    alt="icon"
                    width={15}
                    height={15}
                  />
                </span>
              ) : (
                <span
                  className="close-icon"
                  id="close-src"
                  onClick={() => {
                    setShowSearch(false);
                  }}
                >
                  <Image
                    src="/images/close-icon.svg"
                    alt="icon"
                    width={15}
                    height={15}
                  />
                </span>
              )}

              {/* Dropdown Menu */}
              {showSearch && (
                <ul className="dropdown-menu shadow-lg border-0 w-100 show">
                  {isLoadingDoctors ? (
                    <li className="loading">Loading...</li>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <li className="border-bottom py-1" key={doctor.id} onClick={() => selectDoctor(doctor)}>
                        <a className="dropdown-item" href="javascript:void(0)">
                          {doctor.name}
                        </a>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            {/* Search Button */}
            <button
              type="button"
              className="search-btn"
              onClick={() => setShowSearch(true)}
            >
              <Image
                src="/images/search-icon.svg"
                alt="icon"
                width={15}
                height={15}
              />
            </button>
          </div>

          <div className="shorting-filter-area dropdown">
            <button
              className="sf-btn btn dropdown-toggle d-flex align-items-center pe-0"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {selectedFilter === "all" && "All"}
              {selectedFilter === "date" && "Filter by Date"}
              {selectedFilter === "doctor" && "Filter by Doctor"}
              <Image
                src="/images/short-filter-icon.svg"
                alt="icon"
                width={15}
                height={15}
              />
            </button>
            <ul className="dropdown-menu">
              <li>
                <a
                  className={`dropdown-item ${
                    selectedFilter === "all" ? "active" : ""
                  }`}
                  href="javascript:void(0)"
                  onClick={() => setSelectedFilter("all")}
                >
                  <Image
                    className="active-icon"
                    src="../images/active-radio-icon.svg"
                    alt="icon"
                    width={24}
                    height={24}
                  />
                  <Image
                    className="inactive-icon"
                    src="../images/inactive-radio-icon.svg"
                    alt="icon"
                    width={24}
                    height={24}
                  />
                  All
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item ${
                    selectedFilter === "date" ? "active" : ""
                  }`}
                  href="javascript:void(0)"
                  onClick={() => setSelectedFilter("date")}
                >
                  <Image
                    className="active-icon"
                    src="../images/active-radio-icon.svg"
                    alt="icon"
                    width={24}
                    height={24}
                  />
                  <Image
                    className="inactive-icon"
                    src="../images/inactive-radio-icon.svg"
                    alt="icon"
                    width={24}
                    height={24}
                  />
                  filter by Date
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item ${
                    selectedFilter === "doctor" ? "active" : ""
                  }`}
                  href="javascript:void(0)"
                  onClick={() => setSelectedFilter("doctor")}
                >
                  <Image
                    className="active-icon"
                    src="../images/active-radio-icon.svg"
                    alt="icon"
                    width={24}
                    height={24}
                  />
                  <Image
                    className="inactive-icon"
                    src="../images/inactive-radio-icon.svg"
                    alt="icon"
                    width={22}
                    height={24}
                  />
                  filter by Doctor
                </a>
              </li>
            </ul>
          </div>
          <Link
            href={`/view-patient/${patientId}?view=add&tab=prescription`}
            className="btn-patient-sm-add"
          >
            <Image
              src="/images/plus-icon.svg"
              alt="icon"
              width={15}
              height={15}
            />
            Add
          </Link>
        </div>
      </div>
      <div className="timeline-header">
        <h4>Timeline</h4>
      </div>

      {selectedDoctor && (
        <div className="search-by-name">
          <p>
            Search by: <span>{selectedDoctor.name}</span>
          </p>
          <button
            type="button"
            className="btn-close"
            // onClick={() => setSelectedDoctor(null)} // Reset doctor selection
            onClick={() => {
              setSelectedDoctor(null);
            
              setShowSearch(false);
            }}
          ></button>
        </div>
      )}
      {selectedSymptom && (
        <div className="search-by-name tags">
          <p>
            Viewing Presscription tagged with:{" "}
            <span>"{selectedSymptom.description}"</span>
          </p>
          <button
            type="button"
            className="btn-close"
            onClick={() => setSelectedSymptom(null)} // Reset symptom selection
          ></button>
        </div>
      )}
      {loading && (
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="prescription-timeline">
        {Object.entries(prescriptions).length === 0 ? ( // Check if prescriptions are empty
          <div className="no-data">
            <p>No data found</p>
          </div>
        ) : (
          Object.entries(prescriptions).map(([month, monthPrescriptions]) => (
            <div key={month} className="timeline-item">
              <div className="timeline-item-header">
                <h6>
                  {selectedFilter === "doctor" && monthPrescriptions.length > 0
                    ? monthPrescriptions[0].doctor.name // Display the first prescription's doctor name
                    : month}
                </h6>
              </div>
              <div className="timeline-list">
                {monthPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="timeline-item-content">
                    {/* <div className="timeline-item-image">
                      <img
                        src={
                          prescription.images.length > 0
                            ? prescription.images[
                                prescription.images.length - 1
                              ].image_url
                            : "/images/placeholder-patient.svg"
                        }
                        alt={prescription.doctor.name}
                        width={105}
                        height={132}
                        className="thumbnail"
                        // onClick={() =>
                        //   handleImageClick(
                        //     prescription.images.length > 0
                        //       ? prescription.images[
                        //           prescription.images.length - 1
                        //         ].image_url
                        //       : "/images/placeholder-patient.svg",
                        //     prescription.id
                        //   )

                        // }
                        onClick={() =>
                          handleImageClick(
                            prescription.images,
                            prescription.id,
                            prescription.images.length - 1
                          )
                        }
                      />
                    </div> */}
                    <div className="timeline-item-image" style={{ position: 'relative' }}>
  {prescription.images.length > 0 ? (
    <>
      {/* Loading Placeholder */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '105px',
        height: '132px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>

      {/* Actual Image */}
      <img
        src={prescription.images[prescription.images.length - 1].image_url}
        alt={prescription.doctor.name}
        width={105}
        height={132}
        className="thumbnail"
        style={{
          objectFit: 'cover',
          borderRadius: '8px',
          position: 'relative',
          zIndex: 1
        }}
        onLoad={(e) => {
          // Hide loader when image loads
          const target = e.target as HTMLImageElement;
          target.style.zIndex = '2';
        }}
        onClick={() =>
          handleImageClick(
            prescription.images,
            prescription.id,
            prescription.images.length - 1
          )
        }
      />
    </>
  ) : (
    <img
      src="/images/placeholder-patient.svg"
      alt="placeholder"
      width={105}
      height={132}
      style={{
        objectFit: 'cover',
        borderRadius: '8px'
      }}
    />
  )}
</div>
                    <div className="timeline-item-content">
                      <h6>{prescription.doctor.name}</h6>
                      <p>{format(new Date(prescription.date), "dd MMMM")}</p>
                    
                      {prescription.symptoms.length > 0 && (
                        <span
                          className="badge bg-label-dark"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setCurrentPrescription(prescription); // Set the current prescription
                            setShowModal(true); // Show the modal
                          }}
                        >
                          {prescription.symptoms[0].description}{" "}
                          {prescription.symptoms.length > 1 && "+"}
                        </span>
                      )}
                      {showModal && currentPrescription && (
                        <>
                          <div className="modal fade show d-block tags-modal">
                            <div className="modal-dialog modal-dialog-centered">
                              <div className="modal-content">
                                <div className="modal-header">
                                  <div className="modal-head-cus">
                                    <h5 className="modal-title">Tags</h5>
                                    <button
                                      type="button"
                                      className="btn-close"
                                      onClick={() => setShowModal(false)}
                                    ></button>
                                  </div>
                                  <p>
                                    Select tags to view the <br /> related
                                    prescriptions
                                  </p>
                                </div>
                                <div className="modal-body">
                                  <ul className="tag-lists">
                                    {currentPrescription.symptoms.map(
                                      (symptom: any) => (
                                        <li key={symptom.id}>
                                          <a
                                            onClick={() => {
                                              setSelectedSymptom(symptom);
                                              setShowModal(false); // Close modal after selection
                                            }}
                                            style={{
                                              cursor: "pointer",
                                            }}
                                          >
                                            {symptom.description}
                                          </a>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Modal backdrop */}
                          <div
                            className="modal-backdrop fade show"
                            onClick={() => setShowModal(false)}
                          ></div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    
      {showZoomModal && (
        <ImageZoomModal
          images={selectedImages}
          selectedIndex={selectedImageIndex}
          onClose={() => setShowZoomModal(false)}
          prescriptionId={selectedPrescriptionId}
          patientId={String(patientId)}
          imageUrl={""}
        />
      )}
    </>
  );
};

export default Prescription;
