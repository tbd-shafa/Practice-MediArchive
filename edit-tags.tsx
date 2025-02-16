//id.tsx code
 // if (view === "edit" && activeTab === "prescription") {
 //      const { prescriptionId, editTags } = router.query;
      
 //      if (editTags === "true") {
 //        return <PrescriptionEditTags patientId={id} prescriptionId={prescriptionId as string} />;
 //      }
    
 //      return <PrescriptionEdit patientId={id} prescriptionId={prescriptionId as string} />;
 //    }

// const PrescriptionEditTags = dynamic(() => import("./prescription/edit-tags"), {
//   ssr: false,
// });

//edit.tsx code
// import { FC, useState, useRef, useEffect } from "react";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faTimesCircle,
  faTrash,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

 import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import React, { useEffect, useRef, useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import "react-datepicker/dist/react-datepicker.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { api, ApiResponse } from "../../../services/api";
import config from "../../../config";

interface PrescriptionEditProps {
  patientId: string | string[]; // Allow string or string[]
  prescriptionId: string; // Add prescriptionId to the props interface
}

const PrescriptionEdit: React.FC<PrescriptionEditProps> = ({
  patientId,
  prescriptionId,
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: "",
    images: [] as string[],
    doctors: [] as { id: number; name: string }[],
    symptoms: [] as { id: number; description: string }[],
  });
 
   const [isLoading, setIsLoading] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    localStorage.setItem("selectedDate", date.toISOString()); // Store the date in localStorage
  };
  
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [showSymptomsList, setShowSymptomsList] = useState(false);
  const [newSymptomName, setNewSymptomName] = useState("");

  const [newTag, setNewTag] = useState("");
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(true);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<Doctor[]>([]);
  const [showDoctorsList, setShowDoctorsList] = useState(false);
  const [newDoctor, setNewDoctor] = useState("");
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

   // Fetch prescription data on component mount
   useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await api.get<ApiResponse>(
          `${config.API_ENDPOINTS.PRESCRIPTION_ADD}/${prescriptionId}/`
        );
        const data = response.data;
        setFormData({
        
          date: response.data.date,
              images: response.data.images.map((img: any) => img.image_url),
              doctors: response.data.doctors,
              symptoms: response.data.symptoms,
        });
        
        // Set the selected doctor from the prescription data
        if (data.doctor) {
          const doctorData = {
            id: data.doctor.id,
            name: data.doctor.name,
            client_id: data.client_id,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
          setSelectedDoctors([doctorData]);
          // Update localStorage with the selected doctor
          localStorage.setItem("selectedDoctors", JSON.stringify([doctorData]));
        }

        // Set the selected symptoms from the prescription data
        // if (data.symptoms && Array.isArray(data.symptoms)) {
       
        //   localStorage.setItem("selectedSymptoms", JSON.stringify(data.symptoms));
        // }

        if (data.symptoms && data.symptoms.length > 0) {
       
          setSelectedSymptoms(data.symptoms);
          localStorage.setItem("selectedSymptoms", JSON.stringify(data.symptoms));
        }

        setSelectedDate(new Date(data.date));
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch prescription:", error);
        toast.error("Failed to fetch prescription data");
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [prescriptionId]);
  
 

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true); // Set loading to true
      try {
        const response = await PrescriptionService.getDoctors();
        if (response.status === "success") {
          setDoctors(response.data);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to fetch doctors");
      } finally {
        setIsLoadingDoctors(false);
        setLoading(false); // Set loading to false
      }
    };

    fetchDoctors();
  }, []);

  const handleDoctorSelect = (doctor: Doctor) => {
    const updatedDoctors = [doctor];
    setSelectedDoctors(updatedDoctors);

    // Store selected doctors in localStorage
    localStorage.setItem("selectedDoctors", JSON.stringify(updatedDoctors));

    setShowDoctorsList(false);
    setNewDoctor("");
  };

  const handleAddNewDoctor = async () => {
    if (!newDoctor.trim()) return;

    try {
      const response = await PrescriptionService.createDoctor(newDoctor);
      if (response.status === "success" && response.data) {
        const newDoctorData = {
          id: response.data.id,
          name: response.data.name,
          client_id: response.data.client_id,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
        };
        setDoctors((prev) => [...prev, newDoctorData]);

        const updatedDoctors = [newDoctorData];
        setSelectedDoctors(updatedDoctors);

        // Store selected doctors in localStorage
        localStorage.setItem("selectedDoctors", JSON.stringify(updatedDoctors));

        setShowDoctorsList(false);
        setNewDoctor("");
      }
    } catch (error) {
      console.error("Error adding new doctor:", error);
      toast.error("Failed to add new doctor");
    }
  };

  useEffect(() => {
    const storedDoctors = localStorage.getItem("selectedDoctors");
    if (storedDoctors) {
      try {
        const parsedDoctors = JSON.parse(storedDoctors);
        setSelectedDoctors(parsedDoctors);
      } catch (error) {
        console.error("Error parsing stored doctors:", error);
      }
    }
  }, []);

  const removeDoctor = (doctorId: number) => {
    setSelectedDoctors([]);
  };

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Use window.location.origin to support different environments
      const parsedUrl =
        typeof window !== "undefined"
          ? new URL(url, window.location.origin)
          : new URL(url, "http://localhost:3000");

      const view = parsedUrl.searchParams.get("view");
      const tab = parsedUrl.searchParams.get("tab");

      // Check if the route does NOT have both view=add and tab=prescription
      const isNotPrescriptionAddPage = view !== "edit" || tab !== "prescription";

      if (isNotPrescriptionAddPage) {
        // Clear localStorage
        localStorage.removeItem("PrescriptionImages");
        localStorage.removeItem("selectedSymptoms");
        localStorage.removeItem("selectedDoctors");
        localStorage.removeItem("selectedDate"); // Clear the selected date
        // Reset state
        setSelectedSymptoms([]);
        setUploadedFiles([]);
        setSelectedDoctors([]);
        setSelectedDate(new Date()); // Reset to today's date if desired
      }
    };

    // Add event listener for route changes
    router.events.on("routeChangeStart", handleRouteChange);

    // Cleanup event listener
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);
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

  // Handle symptoms from edit-tags page
  useEffect(() => {
    const { selectedsymptoms } = router.query;

    if (selectedsymptoms && typeof selectedsymptoms === 'string') {
      try {
        const parsedSymptoms = JSON.parse(selectedsymptoms);
        // Update both state and localStorage
        setSelectedSymptoms(parsedSymptoms);
        localStorage.setItem("selectedSymptoms", JSON.stringify(parsedSymptoms));

        // Clean up the URL
        const { selectedsymptoms: _, ...restQuery } = router.query;
        router.replace(
          {
            pathname: router.pathname,
            query: restQuery,
          },
          undefined,
          { shallow: true }
        );
      } catch (error) {
        console.error("Error parsing selected symptoms:", error);
      }
    }
  }, [router.query.selectedsymptoms]); // Only run when selectedsymptoms changes

  // Load symptoms from localStorage on mount
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
  // const navigateToAddTags = () => {
  //   router.push({
  //     pathname: `/view-patient/${patientId}`,
  //     query: {
  //       ...router.query,
  //       view: "add",
  //       tab: "prescription",
  //       addTags: "true",
  //     },
  //   });
  // };
  const navigateToAddTags = () => {
    router.push({
      pathname: `/view-patient/${patientId}`,
      query: {
        ...router.query,
        view: "edit", // Change from 'add' to 'edit'
        tab: "prescription",
        editTags: "true", // Update query parameter
        prescriptionId,  // Ensure the prescription ID is included
      },
    });
  };

  useEffect(() => {
    const storedDate = localStorage.getItem("selectedDate");
    if (storedDate) {
      setSelectedDate(new Date(storedDate)); // Set the stored date
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    let hasError = false;
    const errors: { [key: string]: string } = {};

    if (!selectedDate) {
      errors.date = "Date is required";
      hasError = true;
    }

    if (selectedDoctors.length === 0) {
      errors.doctor = "Doctor is required";
      hasError = true;
    }

    if (selectedSymptoms.length === 0) {
      errors.symptoms = "At least one symptom is required";
      hasError = true;
    }

    if (hasError) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      if (!prescriptionId) {
        throw new Error("Prescription ID is required for update");
      }

      const response = await PrescriptionService.updatePrescription(
        prescriptionId,
        selectedDoctors[0].id,
        selectedDoctors[0].name,
        format(selectedDate, "yyyy-MM-dd"),
        selectedSymptoms.map((s) => s.id),
        uploadedFiles
      );

      if (response.status === "success") {
        // Clear localStorage
        localStorage.removeItem("PrescriptionImages");
        localStorage.removeItem("selectedSymptoms");
        localStorage.removeItem("selectedDoctors");
        localStorage.removeItem("selectedDate");
        
        toast.success("Prescription updated successfully");
        
        // Navigate back to prescription list after successful update
        setTimeout(() => {
          router.push(`/view-patient/${patientId}?tab=prescription`);
        }, 1000);
      } else {
        toast.error(response.message || "Failed to update prescription");
      }
    } catch (error: any) {
      console.error("Error updating prescription:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update prescription. Please try again.";
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
          <span className="icon prescription"></span> Edit Prescription
        </h5>
        <Link
          href={`/view-patient/${patientId}?tab=prescription`}
          className="btn-patient-sm-add"
        >
          Cancel
        </Link>
      </div>
      {(selectedDoctors.length > 0 || selectedDate) && (
        <div className="search-by-name">
          {selectedDoctors.length > 0 && (
            <p>
              Doctors: <span>{selectedDoctors[0].name}</span>
            </p>
          )}
          {selectedDate && (
            <p>
              Date: <span>{selectedDate.toLocaleDateString('en-US', { 
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</span>
            </p>
          )}
        </div>
      )}
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
                                      selected={selectedDate}
                    //onChange={(date: Date) => setSelectedDate(date)}
                    onChange={handleDateChange}
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
                    {selectedDoctors.map((doctor) => (
                      <span
                        key={doctor.id}
                        className="d-inline-flex align-items-center"
                        style={{
                          backgroundColor: "#e9ecef",
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "14px",
                        }}
                      >
                        {doctor.name}
                        <button
                          type="button"
                          onClick={() => removeDoctor(doctor.id)}
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

                    {!selectedDoctors.length && (
                      <button
                        type="button"
                        onClick={() => setShowDoctorsList(!showDoctorsList)}
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

                  {showDoctorsList && (
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
                            value={newDoctor}
                            onChange={(e) => setNewDoctor(e.target.value)}
                            className="form-control form-control-sm"
                            placeholder="Search or add new doctor"
                            autoFocus
                            style={{ maxHeight: 30, fontWeight: 400 }}
                          />
                          {newDoctor && (
                            <button
                              className="btn btn-sm"
                              onClick={handleAddNewDoctor}
                              style={{
                                height: 38,
                                padding: 0,
                                paddingRight: 10,
                              }}
                            >
                              <FontAwesomeIcon icon={faPlus} color="#1A72E8" />
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
                                .includes(newDoctor.toLowerCase()) &&
                              !selectedDoctors.find(
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
                        {isLoadingDoctors && (
                          <div className="p-3 text-center text-muted">
                            Loading doctors...
                          </div>
                        )}
                        {!isLoadingDoctors &&
                          doctors.filter(
                            (d) =>
                              d.name
                                .toLowerCase()
                                .includes(newDoctor.toLowerCase()) &&
                              !selectedDoctors.find(
                                (selected) => selected.id === d.id
                              )
                          ).length === 0 && (
                            <div className="p-3 text-center text-muted">
                              {newDoctor
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
                {formErrors.testNames && (
                  <div className="invalid-feedback d-block">
                    {formErrors.testNames}
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

export default PrescriptionEdit;
function setSelectedDate(arg0: Date) {
    throw new Error("Function not implemented.");
}

//prescription service code
 static async updatePrescription(
    prescriptionId: string,
    doctorId: number,
    doctorName: string,
    date: string,
    symptomIds: number[],
    files: File[]
  ): Promise<any> {
    const formData = new FormData();
    
    formData.append("doctor_id", doctorId.toString());
    formData.append("doctor", doctorName);
    formData.append("date", date);
    formData.append("symptom_ids", symptomIds.join(","));

    // // Append files if any
    // files.forEach((file) => {
    //   formData.append("files", file);
    // });

    return await api.put(
      `${config.API_ENDPOINTS.PRESCRIPTION_ADD}/${prescriptionId}/`,
      formData,
      {
        requiresAuth: true,
       
      }
    );
  }


import { FC, useState, useEffect } from "react";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import {
  PrescriptionService,
  Symptom,
} from "../../../services/PrescriptionService";

interface PrescriptionEditTagsProps {
  patientId: string | string[] | undefined;
  prescriptionId: string | string[] | undefined;
}

const PrescriptionEditTags: FC<PrescriptionEditTagsProps> = ({ patientId, prescriptionId }) => {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all available symptoms and load selected ones
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const response = await PrescriptionService.getSymptoms();
        if (response.status === "success") {
          setSymptoms(response.data.symptoms);
          
          // After fetching all symptoms, load the selected ones from localStorage
          const storedSymptoms = localStorage.getItem("selectedSymptoms");
          if (storedSymptoms) {
            try {
              const parsedSymptoms = JSON.parse(storedSymptoms);
              setSelectedSymptoms(parsedSymptoms);
            } catch (error) {
              console.error("Error parsing stored symptoms:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching symptoms:", error);
        toast.error("Failed to fetch symptoms");
      } finally {
        setIsLoadingSymptoms(false);
      }
    };

    fetchSymptoms();
  }, []);

  // Filter symptoms based on search
  const filteredSymptoms = symptoms.filter((symptom) =>
    symptom.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSymptomSelect = (symptom: Symptom) => {
    if (!selectedSymptoms.find((t) => t.id === symptom.id)) {
      const updatedSymptoms = [...selectedSymptoms, symptom];
      setSelectedSymptoms(updatedSymptoms);
      localStorage.setItem("selectedSymptoms", JSON.stringify(updatedSymptoms));
    }
  };

  const removeSymptom = (symptomId: number) => {
    const updatedSymptoms = selectedSymptoms.filter((t) => t.id !== symptomId);
    setSelectedSymptoms(updatedSymptoms);
    localStorage.setItem("selectedSymptoms", JSON.stringify(updatedSymptoms));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleAddNewSymptom = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await PrescriptionService.createSymptom(searchTerm.trim());
      if (response.status === "success" && response.data) {
        setSymptoms((prev) => [...prev, response.data]);
        handleSymptomSelect(response.data);
        toast.success("Symptom added successfully");
        setSearchTerm("");
      }
    } catch (error) {
      console.error("Error adding new symptom:", error);
      toast.error("Failed to add new symptom");
    }
  };

  const handleDone = () => {
    // First update localStorage
    localStorage.setItem("selectedSymptoms", JSON.stringify(selectedSymptoms));
    
    // Then navigate back with the selected symptoms
    router.push({
      pathname: `/view-patient/${patientId}`,
      query: {
        view: "edit",
        tab: "prescription",
        prescriptionId,
        selectedsymptoms: JSON.stringify(selectedSymptoms),
      },
    });
  };

  return (
    <>
      <ToastContainer />
      <div className="patient-view-content-header">
        <h5 className="card-title">
          <span className="icon lab-report"></span> Edit Prescription Tags
        </h5>
        <Link
          href={`/view-patient/${patientId}?view=edit&tab=prescription&prescriptionId=${prescriptionId}`}
          className="btn-patient-sm-add close-btn"
        >
          Close
        </Link>
      </div>

      <div className="lab-rpt-tags-full-area">
        <div className="top-header">
          <p>Search tags to Add for this prescription</p>
          <div className="search-area">
            <input
              type="text"
              className="search-field"
              id="search"
              placeholder="Start typing..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button
              type="button"
              className="search-btn"
              onClick={handleAddNewSymptom}
            >
              <FontAwesomeIcon icon={faSearch} color="#A8AAAA" />
            </button>
          </div>
        </div>
        <div className="body-section">
          <div className="add-new-area">
            <a
              className="add-new-tag-btn"
              id="add-new-tag"
              onClick={handleAddNewSymptom}
              style={{ cursor: "pointer" }}
            >
              + Add as new
            </a>
          </div>
          <div className="list-area">
            <ul className="lists">
              {filteredSymptoms.map((symptom) => {
                const isSelected = selectedSymptoms.some((t) => t.id === symptom.id);
                return (
                  <li className="item" key={symptom.id}>
                    <span>{symptom.description}</span>
                    {!isSelected ? (
                      <a href="#" className="add" onClick={() => handleSymptomSelect(symptom)}>
                        Add
                      </a>
                    ) : (
                      <a href="#" className="cancel" onClick={() => removeSymptom(symptom.id)}>
                        Cancel
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="d-flex justify-content-center">
            <button className="btn btn-primary mx-2" onClick={handleDone}>
              DONE
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrescriptionEditTags;
