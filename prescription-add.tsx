import { FC, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import {
  PrescriptionService,
  Symptom,
  Doctor,
} from "../../../services/PrescriptionService";

interface PrescriptionAddProps {
  patientId: string | string[] | undefined;
}

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faTrash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const PrescriptionAdd: FC<PrescriptionAddProps> = ({ patientId }) => {
  const router = useRouter();
  const [selectedDateAddPrescription, setSelectedDateAddPrescription] = useState<Date>(new Date());
  const handleDateAddPrescriptionChange = (date: Date) => {
    setSelectedDateAddPrescription(date);
    localStorage.setItem("selectedDateAddPrescription", date.toISOString()); // Store the DateAddPrescription in localStorage
  };
  const [formData, setFormData] = useState({
    prescribedBy: "",
    images: [] as string[],
    tags: [] as string[],
  });
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [showSymptomsList, setShowSymptomsList] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(true);

  const [doctors, setPrescriptionAddDcotors] = useState<Doctor[]>([]);
  const [selectedPrescriptionAddDcotors, setSelectedPrescriptionAddDcotors] = useState<Doctor[]>([]);
  const [showPrescriptionAddDcotorsList, setShowPrescriptionAddDcotorsList] = useState(false);
  const [newPrescriptionAddDcotor, setNewPrescriptionAddDcotor] = useState("");
  const [isLoadingPrescriptionAddDcotors, setIsLoadingPrescriptionAddDcotors] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchSymptoms = async () => {
      setLoading(true); // Set loading to true
      try {
        const response = await PrescriptionService.getSymptoms();
        if (response.status === "success") {
          setSymptoms(response.data.symptoms);
        }
      } catch (error) {
        console.error("Error fetching symptoms:", error);
        toast.error("Failed to fetch symptoms");
      } finally {
        setIsLoadingSymptoms(false);
        setLoading(false); // Set loading to false
      }
    };

    fetchSymptoms();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true); // Set loading to true
      try {
        const response = await PrescriptionService.getDoctors();
        if (response.status === "success") {
          setPrescriptionAddDcotors(response.data);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to fetch PrescriptionAddDcotors");
      } finally {
        setIsLoadingPrescriptionAddDcotors(false);
        setLoading(false); // Set loading to false
      }
    };

    fetchDoctors();
  }, []);

  const handleDoctorSelect = (doctor: Doctor) => {
    const updatedPrescriptionAddDcotors = [doctor];
    setSelectedPrescriptionAddDcotors(updatedPrescriptionAddDcotors);

    // Store selected PrescriptionAddDcotors in localStorage
    localStorage.setItem("selectedPrescriptionAddDcotors", JSON.stringify(updatedPrescriptionAddDcotors));

    setShowPrescriptionAddDcotorsList(false);
    setNewPrescriptionAddDcotor("");
  };

  const handleAddNewDoctor = async () => {
    event.preventDefault();
    if (!newPrescriptionAddDcotor.trim()) return;

    try {
      const response = await PrescriptionService.createDoctor(newPrescriptionAddDcotor);
      if (response.status === "success" && response.data) {
        const newDoctorData = {
          id: response.data.id,
          name: response.data.name,
          client_id: response.data.client_id,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
        };
        setPrescriptionAddDcotors((prev) => [...prev, newDoctorData]);

        const updatedDoctors = [newDoctorData];
        setSelectedPrescriptionAddDcotors(updatedDoctors);

        // Store selected PrescriptionAddDcotors in localStorage
        localStorage.setItem("selectedPrescriptionAddDcotors", JSON.stringify(updatedDoctors));

        setShowPrescriptionAddDcotorsList(false);
        setNewPrescriptionAddDcotor("");
        toast.success("New Doctor added successfully");
      }
    } catch (error) {
      console.error("Error adding new PrescriptionAddDcotor:", error);
      toast.error("Failed to add new Dcotor");
    }
  };

  useEffect(() => {
    const storedPrescriptionAddDcotors = localStorage.getItem("selectedPrescriptionAddDcotors");
    if (storedPrescriptionAddDcotors) {
      try {
        const parsedPrescriptionAddDcotors = JSON.parse(storedPrescriptionAddDcotors);
        setSelectedPrescriptionAddDcotors(parsedPrescriptionAddDcotors);
      } catch (error) {
        console.error("Error parsing stored PrescriptionAddDcotors:", error);
      }
    }
  }, []);

  const removeDoctor = (doctorId: number) => {
    setSelectedPrescriptionAddDcotors([]);
    localStorage.removeItem("selectedPrescriptionAddDcotors");
  };



  const sliderRef = useRef<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 0) {
      const newUploadedFiles = [...uploadedFiles, ...files];
      setUploadedFiles(newUploadedFiles);

      const newImages = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newImages).then((imageUrls) => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...imageUrls],
        }));
      });

      // Scroll to the last item when images are added
      setTimeout(() => {
        if (sliderRef.current) {
          sliderRef.current.slickGoTo(newUploadedFiles.length);
        }
      }, 300);

      e.target.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    // Remove from uploadedFiles
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );

    // Remove from formData.images
    setFormData((prev) => {
      const updatedImages = prev.images.filter(
        (_, index) => index !== indexToRemove
      );

      // Update localStorage
      localStorage.setItem("PrescriptionImages", JSON.stringify(updatedImages));

      return {
        ...prev,
        images: updatedImages,
      };
    });
  };

  // On component mount, load images from localStorage
  useEffect(() => {
    const storedImages = localStorage.getItem("PrescriptionImages");
    if (storedImages) {
      const parsedImages = JSON.parse(storedImages);

      // Convert stored base64 images to File objects
      const filePromises = parsedImages.map(async (imageUrl: string) => {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new File([blob], `image_${Date.now()}.jpg`, {
          type: blob.type,
        });
      });

      Promise.all(filePromises).then((files) => {
        setUploadedFiles(files);
        setFormData((prev) => ({
          ...prev,
          images: parsedImages,
        }));
      });
    }
  }, []);

  // Add a method to clear images when form is submitted or reset
  const clearImages = () => {
    setUploadedFiles([]);
    setFormData((prev) => ({
      ...prev,
      images: [],
    }));
    localStorage.removeItem("PrescriptionImages");
  };

  useEffect(() => {
    const { uploadedImages } = router.query;

    if (uploadedImages) {
      try {
        const parsedImages = JSON.parse(uploadedImages as string);

        // Convert base64 to File objects
        const filePromises = parsedImages.map(async (imageUrl: string) => {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          return new File([blob], `image_${Date.now()}.jpg`, {
            type: blob.type,
          });
        });

        // Append parsed images to existing images
        Promise.all(filePromises).then((files) => {
          // Store images in localStorage to persist across navigation
          const currentImages = JSON.parse(
            localStorage.getItem("PrescriptionImages") || "[]"
          );

          // Filter out duplicate images
          const newImages = parsedImages.filter(
            (newImage: string) => !currentImages.includes(newImage)
          );

          const updatedImages = [...currentImages, ...newImages];

          // Update localStorage
          localStorage.setItem(
            "PrescriptionImages",
            JSON.stringify(updatedImages)
          );

          // Update state
          setUploadedFiles((prev) => {
            const newFiles = files.filter(
              (file) =>
                !prev.some(
                  (existingFile) =>
                    existingFile.name === file.name &&
                    existingFile.size === file.size
                )
            );
            return [...prev, ...newFiles];
          });

          setFormData((prev) => ({
            ...prev,
            images: updatedImages,
          }));

          // Remove uploadedImages from query to prevent re-adding
          router.replace(
            {
              pathname: router.pathname,
              query: { ...router.query, uploadedImages: undefined },
            },
            undefined,
            { shallow: true }
          );
        });
      } catch (error) {
        console.error("Error parsing uploaded images:", error);
      }
    }
  }, [router.query]);

  useEffect(() => {
    const storedImages = JSON.parse(
      localStorage.getItem("PrescriptionImages") || "[]"
    );

    if (storedImages.length > 0) {
      const filePromises = storedImages.map(async (imageUrl: string) => {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new File([blob], `image_${Date.now()}.jpg`, {
          type: blob.type,
        });
      });

      Promise.all(filePromises).then((files) => {
        setUploadedFiles(files);
        setFormData((prev) => ({
          ...prev,
          images: storedImages,
        }));
      });
    }
  }, []);
  // Slick settings

  const handleSymptomSelect = (symptom: Symptom) => {
    const updatedSymptoms = [...selectedSymptoms, symptom].filter(
      (t, index, self) => index === self.findIndex((st) => st.id === t.id)
    );

    setSelectedSymptoms(updatedSymptoms);

    // Store in localStorage
    localStorage.setItem("selectedSymptoms", JSON.stringify(updatedSymptoms));

    setShowSymptomsList(false);
    setNewTag("");
  };

  const handleAddNewSymptom = async () => {
    if (!newTag.trim()) return;

    try {
      const response = await PrescriptionService.createSymptom(newTag.trim());
      if (response.status === "success" && response.data) {
        setSymptoms((prev) => [...prev, response.data]);
        handleSymptomSelect(response.data);
        toast.success("Symptom added successfully");
      }
    } catch (error) {
      console.error("Error adding new SYMPTOM name:", error);
      toast.error("Failed to add new SYMPTOM name");
    }
  };
  // Modify removeTestName to update localStorage
  const removeSymptom = (symptomId: number) => {
    const updatedSymptoms = selectedSymptoms.filter((t) => t.id !== symptomId);

    setSelectedSymptoms(updatedSymptoms);

    // Update localStorage
    localStorage.setItem("selectedSymptoms", JSON.stringify(updatedSymptoms));
  };

  // On component mount, load test names from localStorage
  useEffect(() => {
    const storedSymptoms = localStorage.getItem("selectedSymptoms");
    if (storedSymptoms) {
      try {
        const parsedSymptoms = JSON.parse(storedSymptoms);
        setSelectedSymptoms(parsedSymptoms);
      } catch (error) {
        console.error("Error parsing stored symptoms:", error);
      }
    }
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: formData.images.length >= 3 ? 3 : formData.images.length + 1, // Add space for + Add Image
    slidesToScroll: 1,
    arrows: true,
  };
  const navigateToImageAttachment = () => {
    router.push({
      pathname: `/view-patient/${patientId}`,
      query: {
        ...router.query,
        view: "add",
        tab: "prescription",
        imageAttachment: "true",
      },
    });
  };
  const navigateToAddTags = () => {
    // Store current selected symptoms in localStorage before navigation
    localStorage.setItem("tempSelectedSymptoms", JSON.stringify(selectedSymptoms));
    
    router.push({
      pathname: `/view-patient/${patientId}`,
      query: {
        ...router.query,
        view: "add",
        tab: "prescription",
        addTags: "true",
      },
    });
  };
  useEffect(() => {
    const { selectedsymptoms } = router.query;

    if (selectedsymptoms) {
      try {
        const parsedsymptoms = JSON.parse(selectedsymptoms as string);

        // Combine with existing localStorage test names
        const existingSymptoms = JSON.parse(
          localStorage.getItem("selectedSymptoms") || "[]"
        );

        const combinedSymptoms = [
          ...existingSymptoms,
          ...parsedsymptoms.filter(
            (newSymptom: Symptom) =>
              !existingSymptoms.some(
                (existingSymptom: Symptom) =>
                  existingSymptom.id === newSymptom.id
              )
          ),
        ];

        // Update localStorage and state
        localStorage.setItem(
          "selectedSymptoms",
          JSON.stringify(combinedSymptoms)
        );
        setSelectedSymptoms(combinedSymptoms);

        // Remove selectedTestNames from query to prevent re-adding
        router.replace(
          {
            pathname: router.pathname,
            query: { ...router.query, selectedsymptoms: undefined },
          },
          undefined,
          { shallow: true }
        );
      } catch (error) {
        console.error("Error parsing selected Symptom names:", error);
      }
    }
  }, [router.query]);

  useEffect(() => {
    const storedDateAddPrescription = localStorage.getItem("selectedDateAddPrescription");
    if (storedDateAddPrescription) {
      setSelectedDateAddPrescription(new Date(storedDateAddPrescription)); // Set the stored DateAddPrescription
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    let hasError = false;
    const errors: { [key: string]: string } = {};

    if (!selectedDateAddPrescription) {
      errors.date = "Date is required";
      hasError = true;
    }

    if (selectedPrescriptionAddDcotors.length === 0) {
      errors.doctor = "Doctor is required";
      hasError = true;
    }

    // if (selectedSymptoms.length === 0) {
    //   errors.symptoms = "At least one symptom is required";
    //   hasError = true;
    // }

    if (uploadedFiles.length === 0) {
      errors.images = 'At least one image is required';
      hasError = true;
    }

    if (hasError) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const response = await PrescriptionService.createPrescription(
        patientId as string,
        selectedPrescriptionAddDcotors[0].id,
        selectedPrescriptionAddDcotors[0].name,
        format(selectedDateAddPrescription, "yyyy-MM-dd"),
        selectedSymptoms.map((s) => s.id),
        uploadedFiles
      );

      if (response.status === "success") {
        localStorage.removeItem("PrescriptionImages");
        localStorage.removeItem("selectedSymptoms");
        localStorage.removeItem("selectedPrescriptionAddDcotors");
        // Reset state
        setSelectedSymptoms([]);
        setUploadedFiles([]);
        setSelectedPrescriptionAddDcotors([]);
        toast.success("Prescription added successfully");
        setTimeout(() => {
          router.push(`/view-patient/${patientId}?tab=prescription`);
        }, 1000);
      } else {
        toast.error(response.message || "Failed to add prescription");
      }
    } catch (error: any) {
      console.error("Error adding prescription:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add prescription. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <ToastContainer />
      <div className="patient-view-content-header">
        <h5 className="card-title">
          <span className="icon prescription"></span> Add Prescription
        </h5>
        <Link
          href={`/view-patient/${patientId}?tab=prescription`}
          className="btn-patient-sm-add close-btn"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="add-patient-from-card lab-report-add">
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="prescription-images">
                {formData.images.length > 0 ? (
                  <Slider ref={sliderRef} {...sliderSettings}>
                    {formData.images.map((image, index) => (
                      <div
                        key={index}
                        className="prescription-image position-relative"
                        style={{
                          width: "130px",
                          height: "170px",
                          background: "#f8f9fa",
                          borderRadius: "8px",
                        }}
                      >
                        <img
                          src={image}
                          alt={`Lab Report ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                        <button
                          type="button"
                          className="btn-close position-absolute top-0 end-0 m-2"
                          onClick={() => removeImage(index)}
                          style={{ background: "white" }}
                        >
                          <FontAwesomeIcon icon={faTrash} color="red" />
                        </button>
                      </div>
                    ))}

                    {/* Add Image Section inside Slider */}
                    <div
                      className="add-image-box d-flex flex-column align-items-center justify-content-center"
                      style={{
                        width: "130px",
                        height: "170px",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default
                        e.stopPropagation(); // Stop event bubbling
                        navigateToImageAttachment();
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        id="lab-report-image"
                        hidden
                      />
                      <label
                        htmlFor="lab-report-image"
                        className="d-flex flex-column align-items-center justify-content-center w-100 h-100"
                        style={{ cursor: "pointer" }}
                      >
                        <span
                          style={{
                            fontSize: "30px",
                            color: "#6c757d",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.preventDefault(); // Prevent default
                            e.stopPropagation(); // Stop event bubbling
                            navigateToImageAttachment();
                          }}
                        >
                          +
                        </span>

                        <span
                          style={{ color: "#6c757d", cursor: "pointer" }}
                          onClick={(e) => {
                            e.preventDefault(); // Prevent default
                            e.stopPropagation(); // Stop event bubbling
                            navigateToImageAttachment();
                          }}
                        >
                          Add image
                        </span>
                      </label>
                    </div>
                  </Slider>
                ) : (
                  <div className="d-flex justify-content-center">
                    <div
                      className="add-image-box d-flex flex-column align-items-center justify-content-center"
                      style={{
                        width: "130px",
                        height: "170px",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default
                        e.stopPropagation(); // Stop event bubbling
                        navigateToImageAttachment();
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        id="lab-report-image"
                        hidden
                      />
                      <label
                        htmlFor="lab-report-image"
                        className="d-flex flex-column align-items-center justify-content-center w-100 h-100"
                        style={{ cursor: "pointer" }}
                      >
                        <span
                          style={{
                            fontSize: "30px",
                            color: "#6c757d",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.preventDefault(); // Prevent default
                            e.stopPropagation(); // Stop event bubbling
                            navigateToImageAttachment();
                          }}
                        >
                          +
                        </span>
                        <span
                          style={{ color: "#6c757d", cursor: "pointer" }}
                          onClick={(e) => {
                            e.preventDefault(); // Prevent default
                            e.stopPropagation(); // Stop event bubbling
                            navigateToImageAttachment();
                          }}
                        >
                          Add image
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {formErrors.images && (
                <div className="invalid-feedback d-block">
                  {formErrors.images}
                </div>
              )}
            </div>

            <div className="col-md-6 mb-3 form-input-area">
              <div className="form-group">
                <label>
                  Date <span>(required)</span>
                </label>
                <div className="date-picker-input-full">
                  <DatePicker
                    selected={selectedDateAddPrescription}
                    //onChange={(date: Date) => setSelectedDate(date)}
                    onChange={handleDateAddPrescriptionChange}
                    dateFormat="dd MMMM yyyy"
                    className={`form-control ${
                      formErrors.date ? "is-invalid" : ""
                    }`}
                    placeholderText="Select Date"
                  />
                  {formErrors.date && (
                    <div className="invalid-feedback d-block">
                      {formErrors.date}
                    </div>
                  )}
                  <FontAwesomeIcon icon={faCalendar} color="#A8AAAA" />
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-3 form-input-area">
              <div className="form-group">
                <label>
                  Prescribe by <span>(required)</span>
                </label>
                <div
                  className={`position-relative ${
                    formErrors.doctor ? "is-invalid" : ""
                  }`}
                >
                  <div className="d-flex flex-wrap gap-2 bg-light rounded prescibe-by-area">
                    {selectedPrescriptionAddDcotors.map((doctor) => (
                      <span
                        key={doctor.id}
                        className="d-inline-flex align-items-center"
                        style={{
                          backgroundColor: "transparent",
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "18px",
                          fontWeight: "600",
                        }}
                      >
                        {doctor.name}
                        <button
                          type="button"
                          onClick={() => removeDoctor(doctor.id)}
                          className="btn btn-link p-0"
                          style={{
                            textDecoration: "none",
                            color: "#6c757d",
                            fontSize: "22px",
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    {!selectedPrescriptionAddDcotors.length && (
                      <button
                        type="button"
                        onClick={() => setShowPrescriptionAddDcotorsList(!showPrescriptionAddDcotorsList)}
                        className="btn btn-link p-0 text-primary d-flex align-items-center"
                        style={{
                          textDecoration: "none",
                          fontSize: "14px",
                          width: "100%",
                        }}
                      >
                        Doctor Name
                      </button>
                    )}
                  </div>

                  {showPrescriptionAddDcotorsList && (
                    <div
                      className="position-absolute w-100 bg-white border rounded shadow-sm"
                      style={{
                        zIndex: 1000,
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      <div className="border-bottom">
                        <div className="input-group">
                          <input
                            type="text"
                            value={newPrescriptionAddDcotor}
                            onChange={(e) => setNewPrescriptionAddDcotor(e.target.value)}
                            className="form-control form-control-sm"
                            placeholder="Search or add new Dcotor"
                            autoFocus
                            style={{ maxHeight: 45, fontWeight: 400 }}
                          />
                          {newPrescriptionAddDcotor && (
                            <button
                              className="add-new-btn"
                              onClick={handleAddNewDoctor}
                              style={{
                                height: 45,
                                padding: 0,
                                paddingRight: 10,
                              }}
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="doctor-list">
                        {doctors
                          .filter(
                            (d) =>
                              d.name
                                .toLowerCase()
                                .includes(newPrescriptionAddDcotor.toLowerCase()) &&
                              !selectedPrescriptionAddDcotors.find(
                                (selected) => selected.id === d.id
                              )
                          )
                          .map((doctor) => (
                            <button
                              key={doctor.id}
                              className="dropdown-item py-2 px-3 text-start w-100"
                              onClick={() => handleDoctorSelect(doctor)}
                            >
                              {doctor.name}
                            </button>
                          ))}
                        {isLoadingPrescriptionAddDcotors && (
                          <div className="p-3 text-center text-muted">
                            Loading PrescriptionAddDcotors...
                          </div>
                        )}
                        {!isLoadingPrescriptionAddDcotors &&
                          doctors.filter(
                            (d) =>
                              d.name
                                .toLowerCase()
                                .includes(newPrescriptionAddDcotor.toLowerCase()) &&
                              !selectedPrescriptionAddDcotors.find(
                                (selected) => selected.id === d.id
                              )
                          ).length === 0 && (
                            <div className="p-3 text-center text-muted">
                              {newPrescriptionAddDcotor
                                ? "Press + to add new doctor"
                                : "No doctors available"}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
                {formErrors.doctor && (
                  <div className="invalid-feedback d-block">
                    {formErrors.doctor}
                  </div>
                )}
              </div>
            </div>

           
            <div className="col-md-12 mb-3 form-input-area">
              <div className="form-group">
                <label>Tags</label>
                <div
                  className={`position-relative ${
                    formErrors.symptoms ? "is-invalid" : ""
                  }`}
                >
                  <div className="d-flex flex-wrap gap-2 bg-light rounded prescibe-by-area symtom-tag-area">
                    {selectedSymptoms.map((symptom) => (
                      <span
                        key={symptom.id}
                        className="d-inline-flex align-items-center"
                        style={{
                          backgroundColor: "#e9ecef",
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "14px",
                        }}
                      >
                        {symptom.description}
                        <button
                          type="button"
                          onClick={() => removeSymptom(symptom.id)}
                          className="btn btn-link p-0 ms-2"
                          style={{
                            textDecoration: "none",
                            color: "#6c757d",
                            fontSize: "16px",
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}

                   
                    <span
                      onClick={navigateToAddTags}
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        color: "#1A72E8",
                        backgroundColor: "rgb(233, 236, 239)",
                        padding: "8px 12px",
                        borderRadius: 16,
                        fontSize: 14,
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-1" />
                      Add Tag
                    </span>
                  </div>

                  {showSymptomsList && (
                    <div
                      className="position-absolute w-100 bg-white border rounded shadow-sm"
                      style={{
                        zIndex: 1000,
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      <div className="p-2 border-bottom">
                        <div className="input-group">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            className="form-control form-control-sm"
                            placeholder="Search or add new Symptom"
                            autoFocus
                          />
                          {newTag && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={handleAddNewSymptom}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="test-name-list">
                        {symptoms
                          .filter(
                            (t) =>
                              t.description
                                .toLowerCase()
                                .includes(newTag.toLowerCase()) &&
                              !selectedSymptoms.find(
                                (selected) => selected.id === t.id
                              )
                          )
                          .map((symptom) => (
                            <button
                              key={symptom.id}
                              className="dropdown-item py-2 px-3 text-start w-100"
                              onClick={() => handleSymptomSelect(symptom)}
                            >
                              {symptom.description}
                            </button>
                          ))}
                        {isLoadingSymptoms && (
                          <div className="p-3 text-center text-muted">
                            Loading test names...
                          </div>
                        )}
                        {!isLoadingSymptoms &&
                          symptoms.filter(
                            (t) =>
                              t.description
                                .toLowerCase()
                                .includes(newTag.toLowerCase()) &&
                              !selectedSymptoms.find(
                                (selected) => selected.id === t.id
                              )
                          ).length === 0 && (
                            <div className="p-3 text-center text-muted">
                              {newTag
                                ? "Press + to add new test name"
                                : "No test names available"}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
                {formErrors.symptoms && (
                  <div className="invalid-feedback d-block">
                    {formErrors.symptoms}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            type="submit"
            className="btn btn-primary w-242px"
            disabled={isSaving}
          >
            {isSaving ? "SAVING..." : "SAVE"}
          </button>
        </div>
      </form>
    </>
  );
};

export default PrescriptionAdd;
