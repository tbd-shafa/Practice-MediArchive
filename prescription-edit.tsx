import Link from "next/link";
import { useRouter } from "next/router";
import DatePicker from "react-datepicker";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";
import {
  PrescriptionService,
  Symptom,
  Doctor,
} from "../../../services/PrescriptionService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import Slider from "react-slick";
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
interface Image {
  id: number; // or string, depending on your data
  url: string;
}

// Helper function to get data from localStorage
const getLocalStorage = (key: string, defaultValue: any = null) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error(`Invalid JSON in localStorage for key: ${key}`, error);
      return defaultValue; 
    }
  }
  return defaultValue;
};

const PrescriptionEdit: React.FC<PrescriptionEditProps> = ({
  patientId,
  prescriptionId,
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: "",
    images: [],
    doctors: [] as { id: number; name: string }[],
    symptoms: [] as { id: number; description: string }[],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Initialize states from localStorage first
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const storedDate = getLocalStorage("selectedDate");
    return storedDate ? new Date(storedDate) : new Date();
  });

  const [selectedDoctors, setSelectedDoctors] = useState<Doctor[]>(() => {
    const storedDoctors = getLocalStorage("selectedDoctors");
    return storedDoctors || [];
  });

  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>(() => {
    const storedSymptoms = getLocalStorage("selectedSymptoms");
    return storedSymptoms || [];
  });

  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [showSymptomsList, setShowSymptomsList] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(true);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showDoctorsList, setShowDoctorsList] = useState(false);
  const [newDoctor, setNewDoctor] = useState("");
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showImageDeleteModal, setShowImageDeleteModal] = useState(false);

  const [imageToDelete, setImageToDelete] = useState<any>(null); // Track the image to be deleted

  const [removedApiImageIds, setRemovedApiImageIds] = useState<number[]>(() => {
    const stored = getLocalStorage("removedPrescriptionApiImages");
    return stored ? stored : [];
  });

  const [removedApiSymptomIds, setRemovedApiSymptomIds] = useState<number[]>(
    () => {
      const stored = getLocalStorage("removedPrescriptionSymptoms");
      return stored ? stored : [];
    }
  );

  // Add this state at the top of your component
  const [loadingImages, setLoadingImages] = useState<{ [key: number]: boolean }>({});

  // Fetch prescription data only on mount and when not in edit flow
  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await api.get<ApiResponse>(
          `${config.API_ENDPOINTS.PRESCRIPTION_ADD}/${prescriptionId}/`
        );
        const data = response.data;
        
        // Get existing uploaded images from localStorage
        const storedImages = getLocalStorage("PrescriptionImages");
        const uploadedImages = storedImages ? storedImages : [];

        // Create array of API images with IDs, excluding removed ones
        const apiImages = response.data.images
          .filter((img: any) => !removedApiImageIds.includes(img.id))
          .map((img: any) => ({
            id: img.id,
            url: img.image_url,
          }));

        // Filter out any uploaded images that might duplicate API images
        const filteredUploadedImages = uploadedImages.filter((uploadedImg) => {
          return !apiImages.some((apiImg) => apiImg.url === uploadedImg);
        });

        // Initialize loading state for all images
        const initialLoadingState = [...apiImages].reduce(
          (acc, _, index) => ({ ...acc, [index]: true }),
          {}
        );
        setLoadingImages(initialLoadingState);

        setFormData((prev) => ({
          ...prev,
          images: [...apiImages, ...filteredUploadedImages],
          doctors: response.data.doctors,
          symptoms: response.data.symptoms,
        }));

        // Only set initial values if localStorage is empty
        if (!getLocalStorage("selectedDoctors") && data.doctor) {
          const doctorData = {
            id: data.doctor.id,
            name: data.doctor.name,
            client_id: data.client_id,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
          setSelectedDoctors([doctorData]);
          localStorage.setItem("selectedDoctors", JSON.stringify([doctorData]));
        }

        if (!getLocalStorage("selectedSymptoms") && data.symptoms && Array.isArray(data.symptoms)) {
          const apiSymptoms = data.symptoms.filter(
            (test: any) => !removedApiSymptomIds.includes(test.id)
          );
          setSelectedSymptoms(apiSymptoms);
          localStorage.setItem("selectedSymptoms", JSON.stringify(apiSymptoms));
        }

        if (!getLocalStorage("selectedDate") && data.date) {
          const newDate = new Date(data.date);
          setSelectedDate(newDate);
          localStorage.setItem("selectedDate", newDate.toISOString());
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch prescription:", error);
        setLoading(false);
      }
    };

    // Check if we're in the edit flow
    const { imageAttachment, editTags } = router.query;
    if (!imageAttachment && !editTags) {
      fetchPrescription();
    }
  }, [prescriptionId]);

  // handle doctor selection start
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true); // Set loading to true
      try {
        const response = await PrescriptionService.getDoctors();
        if (response.status === "success") {
          setDoctors(response.data);
        }
      } catch (error) {
        
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
    event.preventDefault();
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
        toast.success("New Doctor added successfully");
      }
    } catch (error) {
      console.error("Error adding new doctor:", error);
      toast.error("Failed to add new doctor");
    }
  };

  const removeDoctor = (doctorId: number) => {
    setSelectedDoctors([]);
  };
  // handle doctor selection end

  const sliderRef = useRef<any>(null);

  //handle image upload start

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
        // Set loading state for new images
        const currentImageCount = formData.images.length;
        const newLoadingStates = imageUrls.reduce(
          (acc, _, index) => ({
            ...acc,
            [currentImageCount + index]: true,
          }),
          {}
        );
        setLoadingImages((prev) => ({ ...prev, ...newLoadingStates }));

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...imageUrls],
        }));
      });

      e.target.value = "";
    }
  };
  // Handle image removal
  // Handle confirmation of image deletion (from fetched Prescription)
  const removeImage = (indexToRemove: number, imageUrl: string) => {
    const image = formData.images[indexToRemove]; // Get the image object (with id and url)
    // Count the number of API images and uploaded images
    const apiImagesCount = formData.images.filter((img) => img.id).length;
    const uploadedImagesCount = formData.images.filter((img) => !img.id).length;

    // Check if we can remove the image
    if (apiImagesCount + uploadedImagesCount <= 1) {
      toast.error(
        "At least one image must remain. To Remove this Please upload one first."
      );
      return;
    }
    if (image && image.id) {
      // If image is from fetched Prescription, show the delete modal
      setImageToDelete({ image, index: indexToRemove });
      setShowImageDeleteModal(true);

      // Add the image ID to removedApiImageIds
      const newRemovedIds = [...removedApiImageIds, image.id];
      setRemovedApiImageIds(newRemovedIds);
      localStorage.setItem(
        "removedPrescriptionApiImages",
        JSON.stringify(newRemovedIds)
      );
    } else {
      // If it's not a fetched image, remove it directly
      setUploadedFiles((prevFiles) =>
        prevFiles.filter((_, index) => index !== indexToRemove)
      );

      // Remove from formData.images
      setFormData((prev) => {
        const updatedImages = prev.images.filter(
          (_, index) => index !== indexToRemove
        );

        // Update localStorage
        localStorage.setItem(
          "PrescriptionImages",
          JSON.stringify(updatedImages)
        );

        return {
          ...prev,
          images: updatedImages,
        };
      });
    }
  };

  const handleImageDelete = async () => {
    const { image, index } = imageToDelete;
    const imageIdToDelete = image.id; // Get the image ID from the selected image

    try {
      const result = await PrescriptionService.deletePrescriptionImage(
        // PrescriptionId,
        Number(prescriptionId),
        imageIdToDelete.toString() // Use image ID for deletion
      );

      if (result.status === "success") {
        toast.success("Image deleted successfully");

        // Remove from local storage and update formData
        setFormData((prev) => {
          const updatedImages = prev.images.filter(
            (img) => img.id !== image.id
          );

          // Get only uploaded images (without id) to store in PrescriptionImages
          const uploadedImages = updatedImages.filter((img) => !img.id);
          localStorage.setItem(
            "PrescriptionImages",
            JSON.stringify(uploadedImages)
          );

          return {
            ...prev,
            images: updatedImages,
          };
        });

        setShowImageDeleteModal(false);
      }
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const removeImage2 = (indexToRemove: number) => {
    // Count the number of API images and uploaded images
    const apiImagesCount = formData.images.filter((img) => img.id).length;
    const uploadedImagesCount = formData.images.filter((img) => !img.id).length;

    // Check if we can remove the image
    if (apiImagesCount + uploadedImagesCount <= 1) {
      toast.error(
        "At least one image must remain. To Remove this Please upload one first."
      );
      return;
    }
    setFormData((prev) => {
      // Get the image to remove from the full array
      const imageToRemove = prev.images[indexToRemove];

      // Filter out the image to remove
      const updatedImages = prev.images.filter(
        (_, index) => index !== indexToRemove
      );

      // Update localStorage with only the uploaded images (images without id)
      const uploadedImages = updatedImages.filter((img) => !img.id);
      localStorage.setItem(
        "PrescriptionImages",
        JSON.stringify(uploadedImages)
      );

      // Update uploadedFiles state
      setUploadedFiles((prevFiles) =>
        prevFiles.filter((_, index) => index !== indexToRemove)
      );

      return {
        ...prev,
        images: updatedImages,
      };
    });
  };

  // On component mount, load images from localStorage
  useEffect(() => {
    const storedImages = getLocalStorage("PrescriptionImages");
    if (storedImages) {
      const parsedImages = storedImages;

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
          return new File([blob], `image_${Date.now()}.jpg`);
        });

        // Append parsed images to existing images
        Promise.all(filePromises).then((files) => {
          // Store images in localStorage to persist across navigation
          const currentImages = getLocalStorage("PrescriptionImages");

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
    const storedImages = getLocalStorage("PrescriptionImages");

    if (storedImages) {
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

  // handle image end

  // handle symptoms start
 
  useEffect(() => {
    const { selectedsymptoms } = router.query;

    if (selectedsymptoms && typeof selectedsymptoms === "string") {
      try {
        const parsedSymptoms = JSON.parse(selectedsymptoms);

        // Update both state and localStorage with the new selections
        setSelectedSymptoms(parsedSymptoms);
        localStorage.setItem(
          "selectedSymptoms",
          JSON.stringify(parsedSymptoms)
        );

        // Reset removed API symptoms since we have new selections
        setRemovedApiSymptomIds([]);
        localStorage.removeItem("removedPrescriptionSymptoms");

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
  }, [router.query.selectedsymptoms]);
  // Load symptoms from localStorage on mount
  useEffect(() => {
    const storedSymptoms = getLocalStorage("selectedSymptoms");
    if (storedSymptoms) {
      try {
        const parsedSymptoms = storedSymptoms;
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



  const removeSymptom = (symptomId: number) => {
    // Check if this is an API Symptoms (exists in formData.symptoms)

    const isApiSymptom = formData.symptoms.some(
      (test: any) => test.id === symptomId
    );

    if (isApiSymptom) {
      // Add to removed API symptoms
      const newRemovedIds = [...removedApiSymptomIds, symptomId];
      setRemovedApiSymptomIds(newRemovedIds);
      localStorage.setItem(
        "removedPrescriptionSymptoms",
        JSON.stringify(newRemovedIds)
      );
    }

    const updatedSymptoms = selectedSymptoms.filter((t) => t.id !== symptomId);

    setSelectedSymptoms(updatedSymptoms);

    // Update localStorage
    localStorage.setItem("selectedSymptoms", JSON.stringify(updatedSymptoms));
  };

  // handle symptoms end

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: formData.images.length >= 3 ? 3 : formData.images.length + 1, // Add space for + Add Image
    slidesToScroll: 1,
    arrows: true,
  };
  const navigateToImageAttachment = () => {
    // Save current state before navigation
    localStorage.setItem("selectedDate", selectedDate.toISOString());
    localStorage.setItem("selectedDoctors", JSON.stringify(selectedDoctors));
    localStorage.setItem("selectedSymptoms", JSON.stringify(selectedSymptoms));

    router.push({
      pathname: `/view-patient/${patientId}`,
      query: {
        ...router.query,
        view: "edit",
        tab: "prescription",
        imageAttachment: "true",
      },
    });
  };

  const navigateToAddTags = () => {
    // Save current state before navigation
    localStorage.setItem("selectedDate", selectedDate.toISOString());
    localStorage.setItem("selectedDoctors", JSON.stringify(selectedDoctors));
    localStorage.setItem("selectedSymptoms", JSON.stringify(selectedSymptoms));

    router.push({
      pathname: `/view-patient/${patientId}`,
      query: {
        ...router.query,
        view: "edit",
        tab: "prescription",
        editTags: "true",
        prescriptionId,
      },
    });
  };

  useEffect(() => {
    const storedDate = getLocalStorage("selectedDate");
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

   

    // Check if there are any images (either from API or uploaded)
    const apiImages = formData.images.filter((img) => img.id);
    const uploadedImages = formData.images.filter((img) => !img.id);

    if (apiImages.length === 0 && uploadedImages.length === 0) {
      errors.images = "At least one image is required";
      hasError = true;
      //toast.error("At least one image is required");
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

      // Convert base64 strings to File objects for uploaded images
      const filePromises = uploadedImages.map(async (imageData) => {
        try {
          const response = await fetch(imageData);
          const blob = await response.blob();
          return new File([blob], `prescription_${Date.now()}.jpg`);
        } catch (error) {
          console.error("Error converting base64 to File:", error);
          return null;
        }
      });

      const files = (await Promise.all(filePromises)).filter(
        (file) => file !== null
      ) as File[];

      const response = await PrescriptionService.updatePrescription(
        prescriptionId,
        selectedDoctors[0].id,
        selectedDoctors[0].name,
        format(selectedDate, "yyyy-MM-dd"),
        selectedSymptoms.map((s) => s.id),
        files // Pass only the uploaded files
      );

      if (response.status === "success") {
        // Clear localStorage
        localStorage.removeItem("PrescriptionImages");
        localStorage.removeItem("selectedSymptoms");
        localStorage.removeItem("selectedDoctors");
        localStorage.removeItem("selectedDate");
        localStorage.removeItem("removedPrescriptionApiImages");
        localStorage.removeItem("removedPrescriptionSymptoms");

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
          className="btn-patient-sm-add close-btn"
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
              Date:{" "}
              <span>
                {selectedDate.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
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
                        {loadingImages[index] && (
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
                        )}
                        <img
                          src={image.url || image}
                          alt={`Lab Report ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            opacity: loadingImages[index] ? 0 : 1,
                          }}
                          onLoad={() => {
                            setLoadingImages(prev => ({ ...prev, [index]: false }));
                          }}
                          onError={() => {
                            setLoadingImages(prev => ({ ...prev, [index]: false }));
                          }}
                        />
                        {/* Show different remove buttons based on image type */}
                        {image.id ? (
                          <button
                            type="button"
                            className="btn-close position-absolute top-0 end-0 m-2"
                            onClick={() => removeImage(index, image.url)}
                            style={{ background: "white" }}
                          >
                            <FontAwesomeIcon icon={faTrash} color="red" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-close position-absolute top-0 end-0 m-2"
                            onClick={() => removeImage2(index)}
                            style={{ background: "white" }}
                          >
                            <FontAwesomeIcon icon={faTrash} color="blue" />
                          </button>
                        )}
                      </div>
                    ))}
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
              {/* Delete Image Confirmation Modal */}
              {showImageDeleteModal && (
                <div
                  className="modal fade confirm-modal patient_remove_cm show"
                  style={{ display: "block" }}
                >
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Confirm Deletion</h5>
                      </div>
                      <div className="modal-body pt-5 pb-3">
                        <h4>
                          Are you sure you <br /> want to Delete This
                          Prescription Image?
                        </h4>
                        <h4>
                          Items That Have Been In Trash <br /> More Than 30 Days
                          Will Be <br /> Automatically Deleted
                        </h4>
                      </div>
                      <div className="modal-footer px-4">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowImageDeleteModal(false)}
                        >
                          NO KEEP THAT
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleImageDelete}
                          data-bs-dismiss="modal"
                        >
                          YES DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                    onChange={(date: Date) => {
                      setSelectedDate(date);
                      localStorage.setItem("selectedDate", date.toISOString());
                    }}
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
                            style={{ maxHeight: 45, fontWeight: 400 }}
                          />
                          {newDoctor && (
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
                            Loading symptoms...
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
                                ? "Press + to add new symptom"
                                : "No symptoms available"}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Message */}
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

export default PrescriptionEdit;
function setSelectedDate(arg0: Date) {
  throw new Error("Function not implemented.");
}
