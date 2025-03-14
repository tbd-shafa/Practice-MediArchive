import Link from "next/link";
import { useRouter } from "next/router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import {
  PrescriptionService,
  Test_name,
  Doctor,
} from "../../../services/PrescriptionService";
import { LabReportService } from "../../../services/LabReportService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import Slider from "react-slick";
import React, { useEffect, useRef, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { api, ApiResponse } from "../../../services/api";
import config from "../../../config";

interface LabReportEditProps {
  patientId: string | string[]; // Allow string or string[]
  labReportId: string; // Add labReportId to the props interface
}
interface Image {
  id: number; // or string, depending on your data
  url: string;
}

const getLocalStorage = (key: string, defaultValue: any = null) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue; // যদি key না থাকে, defaultValue রিটার্ন করবে

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error(`Invalid JSON in localStorage for key: ${key}`, error);
      return defaultValue; // যদি JSON ভুল হয়, তাহলে defaultValue রিটার্ন করবে
    }
  }
  return defaultValue; // যদি window না থাকে (SSR), defaultValue রিটার্ন করবে
};

const LabReportEdit: React.FC<LabReportEditProps> = ({
  patientId,
  labReportId,
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: "",
    images: [],
    doctors: [] as { id: number; name: string }[],
    test_names: [] as { id: number; description: string }[],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const storedDate = getLocalStorage("selectedDate");
    return storedDate ? new Date(storedDate) : new Date();
  });

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    localStorage.setItem("selectedDate", date.toISOString()); // Store the date in localStorage
  };

  const [test_names, setTest_names] = useState<Test_name[]>([]);
  const [selectedTest_names, setSelectedTest_names] = useState<Test_name[]>(() => {
    const storedTest_names = getLocalStorage("selectedTest_names");
    return storedTest_names || [];
  });
  const [showTest_namesList, setShowTest_namesList] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [isLoadingTest_names, setIsLoadingTest_names] = useState(true);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorsLabReportEdit, setSelectedDoctorsLabReportEdit] = useState<Doctor[]>(() => {
    const storedDoctors = getLocalStorage("selectedDoctorsLabReportEdit");
    return storedDoctors || [];
  });
  const [showDoctorsList, setShowDoctorsList] = useState(false);
  const [newDoctor, setNewDoctor] = useState("");
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showImageDeleteModal, setShowImageDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<any>(null);
  const [isSelfSelected, setIsSelfSelected] = useState(false);

  const [isSelfChecked, setIsSelfChecked] = useState(false);

  const handleCheckboxChange = (e) => {
    setIsSelfChecked(e.target.checked);
  };

  const [removedApiImageIds, setRemovedApiImageIds] = useState<number[]>(() => {
    const stored = getLocalStorage("removedLabReportApiImages");
    return stored ? stored : [];
  });

  const [removedApiTestNameIds, setRemovedApiTestNameIds] = useState<number[]>(
    () => {
      const stored = getLocalStorage("removedLabReportTestNames");
      return stored ? stored : [];
    }
  );
  const [loadingImages, setLoadingImages] = useState<{
    [key: number]: boolean;
  }>({});
  // Fetch lab report data only on mount and when not in edit flow
  useEffect(() => {
    const fetchLabReport = async () => {
      try {
        const response = await api.get<ApiResponse>(
          `${config.API_ENDPOINTS.LAB_REPORT}/${labReportId}/`
        );
        const data = response.data;
        const storedDate = getLocalStorage("selectedDate");
        
        // Get existing uploaded images from localStorage
        const storedImages = getLocalStorage("LabReportImages");
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
          test_names: response.data.test_names,
        }));

        // Only set initial values if localStorage is empty
        if (!getLocalStorage("selectedDoctorsLabReportEdit") && data.doctor) {
          const doctorData = {
            id: data.doctor.id,
            name: data.doctor.name,
            client_id: data.client_id,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
          setSelectedDoctorsLabReportEdit([doctorData]);
          localStorage.setItem("selectedDoctorsLabReportEdit", JSON.stringify([doctorData]));
        }

        if (!getLocalStorage("selectedTest_names") && data.test_names && Array.isArray(data.test_names)) {
          const apiTestNames = data.test_names.filter(
            (test: any) => !removedApiTestNameIds.includes(test.id)
          );
          setSelectedTest_names(apiTestNames);
          localStorage.setItem("selectedTest_names", JSON.stringify(apiTestNames));
        }

        if (!storedDate) {
          const newDate = new Date(data.date);
          setSelectedDate(newDate);
          localStorage.setItem("selectedDate", newDate.toISOString());
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch labreport:", error);
        setLoading(false);
      }
    };

    // Check if we're in the edit flow
    const { imageAttachment, editTags } = router.query;
    if (!imageAttachment && !editTags) {
      fetchLabReport();
    }
  }, [labReportId, router.query]);

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
        console.error("Error fetching doctors:", error);
        toast.error("Failed to fetch doctors");
      } finally {
        setIsLoadingDoctors(false);
        setLoading(false); // Set loading to false
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    // Check if Self is present in selectedDoctorsLabReportEdit
    const hasSelfDoctor = selectedDoctorsLabReportEdit.some(
      (doctor) => doctor.name === "Self"
    );
    setIsSelfSelected(hasSelfDoctor);
  }, [selectedDoctorsLabReportEdit]);

  const handleSelfCheckboxChange = () => {
    const newSelfSelected = !isSelfSelected;
    setIsSelfSelected(newSelfSelected);
    
    if (newSelfSelected) {
      // Add Self doctor when checkbox is checked
      const selfDoctor = {
        id: 0,
        name: "Self",
        client_id: 0,
        created_at: "",
        updated_at: "",
      };
      setSelectedDoctorsLabReportEdit([selfDoctor]);
      localStorage.setItem(
        "selectedDoctorsLabReportEdit",
        JSON.stringify([selfDoctor])
      );
    } else {
      // Remove Self doctor when checkbox is unchecked
      setSelectedDoctorsLabReportEdit([]);
      localStorage.setItem(
        "selectedDoctorsLabReportEdit",
        JSON.stringify([])
      );
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    // If selecting a doctor, uncheck Self
    setIsSelfSelected(false);
    
    const updatedDoctors = [doctor];
    setSelectedDoctorsLabReportEdit(updatedDoctors);

    // Store selected doctors in localStorage
    localStorage.setItem(
      "selectedDoctorsLabReportEdit",
      JSON.stringify(updatedDoctors)
    );

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
        setSelectedDoctorsLabReportEdit(updatedDoctors);

        // Store selected doctors in localStorage
        localStorage.setItem(
          "selectedDoctorsLabReportEdit",
          JSON.stringify(updatedDoctors)
        );

        setShowDoctorsList(false);
        setNewDoctor("");
        toast.success("New Doctor added successfully");
      }
    } catch (error) {
      console.error("Error adding new doctor:", error);
      toast.error("Failed to add new doctor");
    }
  };

  useEffect(() => {
    const storedDoctors = getLocalStorage("selectedDoctorsLabReportEdit");
    if (storedDoctors) {
      try {
        const parsedDoctors = storedDoctors;
        setSelectedDoctorsLabReportEdit(parsedDoctors);
      } catch (error) {
        console.error("Error parsing stored doctors:", error);
      }
    }
  }, []);

  const removeDoctor = (doctorId: number) => {
    const updatedDoctors = selectedDoctorsLabReportEdit.filter((doc) => doc.id !== doctorId);
    setSelectedDoctorsLabReportEdit(updatedDoctors);
    
    // Update localStorage with the new list (empty array if no doctors left)
    localStorage.setItem(
      "selectedDoctorsLabReportEdit",
      JSON.stringify(updatedDoctors)
    );

    // If no doctors are left, ensure Self is unchecked
    if (updatedDoctors.length === 0) {
      setIsSelfSelected(false);
    }
    
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
  // Handle image removal
  // Handle confirmation of image deletion (from fetched labreport)
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
      // If image is from fetched labreport, show the delete modal
      setImageToDelete({ image, index: indexToRemove });
      setShowImageDeleteModal(true);

      // Add the image ID to removedApiImageIds
      const newRemovedIds = [...removedApiImageIds, image.id];
      setRemovedApiImageIds(newRemovedIds);
      localStorage.setItem(
        "removedLabReportApiImages",
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
        localStorage.setItem("LabReportImages", JSON.stringify(updatedImages));

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
      const result = await LabReportService.deleteLabReportImage(
        // labReportId,
        Number(labReportId),
        imageIdToDelete.toString() // Use image ID for deletion
      );

      if (result.status === "success") {
        toast.success("Image deleted successfully");

        // Remove from local storage and update formData
        setFormData((prev) => {
          const updatedImages = prev.images.filter(
            (img) => img.id !== image.id
          );

          // Get only uploaded images (without id) to store in LabReportImages
          const uploadedImages = updatedImages.filter((img) => !img.id);
          localStorage.setItem(
            "LabReportImages",
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
      localStorage.setItem("LabReportImages", JSON.stringify(uploadedImages));

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
    const storedImages = getLocalStorage("LabReportImages");
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
    localStorage.removeItem("LabReportImages");
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
          const currentImages = getLocalStorage("LabReportImages");

          // Filter out duplicate images
          const newImages = parsedImages.filter(
            (newImage: string) => !currentImages.includes(newImage)
          );

          const updatedImages = [...currentImages, ...newImages];

          // Update localStorage
          localStorage.setItem(
            "LabReportImages",
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
    const storedImages = getLocalStorage("LabReportImages");

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

  // handle Test_names start
  useEffect(() => {
    const { selectedtest_names } = router.query;

    if (selectedtest_names && typeof selectedtest_names === "string") {
      try {
        const parsedTest_names = JSON.parse(selectedtest_names);

        // Update both state and localStorage with the new selections
        setSelectedTest_names(parsedTest_names);
        localStorage.setItem(
          "selectedTest_names",
          JSON.stringify(parsedTest_names)
        );

        // Reset removed API test names since we have new selections
        setRemovedApiTestNameIds([]);
        localStorage.removeItem("removedLabReportTestNames");

        // Clean up the URL
        const { selectedtest_names: _, ...restQuery } = router.query;
        router.replace(
          {
            pathname: router.pathname,
            query: restQuery,
          },
          undefined,
          { shallow: true }
        );
      } catch (error) {
        console.error("Error parsing selected test_names:", error);
      }
    }
  }, [router.query.selectedtest_names]);
  // Load test_names from localStorage on mount
  useEffect(() => {
    const storedTest_names = getLocalStorage("selectedTest_names");
    if (storedTest_names) {
      try {
        const parsedTest_names = storedTest_names;
        setSelectedTest_names(parsedTest_names);
      } catch (error) {
        console.error("Error parsing stored Test_names:", error);
      }
    }
  }, []);

  const handleTest_nameselect = (test_name: Test_name) => {
    const updatedTest_names = [...selectedTest_names, test_name].filter(
      (t, index, self) => index === self.findIndex((st) => st.id === t.id)
    );

    setSelectedTest_names(updatedTest_names);

    // Store in localStorage
    localStorage.setItem(
      "selectedTest_names",
      JSON.stringify(updatedTest_names)
    );

    setShowTest_namesList(false);
    setNewTag("");
  };


  // Modify removeTestName to update localStorage
  const removeTest_name = (test_nameId: number) => {
    // Check if this is an API test name (exists in formData.test_names)
    const isApiTestName = formData.test_names.some(
      (test: any) => test.id === test_nameId
    );

    if (isApiTestName) {
      // Add to removed API test names
      const newRemovedIds = [...removedApiTestNameIds, test_nameId];
      setRemovedApiTestNameIds(newRemovedIds);
      localStorage.setItem(
        "removedLabReportTestNames",
        JSON.stringify(newRemovedIds)
      );
    }

    const updatedTest_names = selectedTest_names.filter(
      (t) => t.id !== test_nameId
    );
    setSelectedTest_names(updatedTest_names);
    localStorage.setItem(
      "selectedTest_names",
      JSON.stringify(updatedTest_names)
    );
  };
  // handle Test_names end

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
    localStorage.setItem("selectedDoctorsLabReportEdit", JSON.stringify(selectedDoctorsLabReportEdit));
    localStorage.setItem("selectedTest_names", JSON.stringify(selectedTest_names));

    router.push({
      pathname: `/view-patient/${patientId}`,
      query: {
        ...router.query,
        view: "edit",
        tab: "lab-report",
        imageAttachment: "true",
      },
    });
  };

  const navigateToAddTags = () => {
    // Save current state before navigation
    localStorage.setItem("selectedDate", selectedDate.toISOString());
    localStorage.setItem("selectedDoctorsLabReportEdit", JSON.stringify(selectedDoctorsLabReportEdit));
    localStorage.setItem("selectedTest_names", JSON.stringify(selectedTest_names));

    router.push({
      pathname: `/view-patient/${patientId}`,
      query: {
        ...router.query,
        view: "edit",
        tab: "lab-report",
        editTags: "true",
        labReportId,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    let hasError = false;
    const errors: { [key: string]: string } = {};

    if (!selectedDate) {
      errors.date = "Date is required";
      hasError = true;
    }

    if (!isSelfSelected && selectedDoctorsLabReportEdit.length === 0) {
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
      if (!labReportId) {
        throw new Error("LabReport ID is required for update");
      }

      // Convert base64 strings to File objects for uploaded images
      const filePromises = uploadedImages.map(async (imageData) => {
        try {
          const response = await fetch(imageData);
          const blob = await response.blob();
          return new File([blob], `lab_report_${Date.now()}.jpg`);
        } catch (error) {
          console.error("Error converting base64 to File:", error);
          return null;
        }
      });

      const files = (await Promise.all(filePromises)).filter(
        (file) => file !== null
      ) as File[];
      const doctorId = isSelfSelected ? 0 : selectedDoctorsLabReportEdit[0].id;
      const doctorName = isSelfSelected
        ? "Self"
        : selectedDoctorsLabReportEdit[0].name;

      const response = await LabReportService.updateLabReport(
        labReportId,
        doctorId,
        doctorName,

        format(selectedDate, "yyyy-MM-dd"),
        selectedTest_names.map((s) => s.id),
        files // Pass only the uploaded files
      );

      if (response.status === "success") {
        // Clear localStorage
        localStorage.removeItem("LabReportImages");
        localStorage.removeItem("selectedTest_names");
        localStorage.removeItem("selectedDoctorsLabReportEdit");
        localStorage.removeItem("selectedDate");
        localStorage.removeItem("removedLabReportApiImages");
        localStorage.removeItem("removedLabReportTestNames");

        toast.success("LabReport updated successfully");

        // Navigate back to labReport list after successful update
        setTimeout(() => {
          router.push(`/view-patient/${patientId}?tab=lab-report`);
        }, 1000);
      } else {
        toast.error(response.message || "Failed to update labreport");
      }
    } catch (error: any) {
      console.error("Error updating labreport:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update labreport. Please try again.";
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
          <span className="icon prescription"></span> Edit Lab Report
        </h5>
        <Link
          href={`/view-patient/${patientId}?tab=lab-report`}
          className="btn-patient-sm-add"
        >
          Cancel
        </Link>
      </div>
      {(selectedDoctorsLabReportEdit.length > 0 || selectedDate) && (
        <div className="search-by-name">
          {selectedDoctorsLabReportEdit.length > 0 && (
            <p>
              Doctors: <span>{selectedDoctorsLabReportEdit[0].name}</span>
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
                        {/* Loading Placeholder */}
                        {loadingImages[index] && (
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
                        )}

                        {/* Actual Image */}
                        <img
                          src={image.url || image}
                          alt={`Lab Report ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            opacity: loadingImages[index] ? 0 : 1,
                            transition: "opacity 0.3s ease",
                          }}
                          onLoad={() => {
                            setLoadingImages((prev) => ({
                              ...prev,
                              [index]: false,
                            }));
                          }}
                        />
                        {/* Show different remove buttons based on image type */}
                        {image.id ? (
                          // For API-fetched images
                          <button
                            type="button"
                            className="btn-close position-absolute top-0 end-0 m-2"
                            onClick={() => removeImage(index, image.url)}
                            style={{ background: "white", zIndex: 2 }}
                          >
                            <FontAwesomeIcon icon={faTrash} color="red" />
                          </button>
                        ) : (
                          // For newly uploaded images
                          <button
                            type="button"
                            className="btn-close position-absolute top-0 end-0 m-2"
                            onClick={() => removeImage2(index)}
                            style={{ background: "white", zIndex: 2 }}
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
                          Are you sure you <br /> want to Delete This LabReport
                          Image?
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
                <div className="d-flex align-items-center justify-content-between">
                  <label>
                    Prescribe by <span>(required)</span>
                  </label>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="selfCheckbox"
                      checked={isSelfSelected}
                      onChange={handleSelfCheckboxChange}
                    />

                    <label
                      className="form-check-label mb-0 pt-1"
                      htmlFor="selfCheckbox"
                    >
                      Self
                    </label>
                  </div>
                </div>

                <div
                  className={`doctor-input-area position-relative ${
                    formErrors.doctor ? "is-invalid" : ""
                  } ${isSelfSelected ? "disabled" : ""}`}
                >
                  <div className="d-flex flex-wrap gap-2 bg-light rounded prescibe-by-area">
                    {!isSelfSelected &&
                      selectedDoctorsLabReportEdit.map((doctor) => (
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
                              fontSize: "16px",
                              lineHeight: 1,
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    {!selectedDoctorsLabReportEdit.length &&
                      !isSelfSelected && (
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
                            disabled={isSelfSelected} // Disable if Self is checked
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
                              !selectedDoctorsLabReportEdit.find(
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
                              !selectedDoctorsLabReportEdit.find(
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
                    formErrors.test_names ? "is-invalid" : ""
                  }`}
                >
                  <div className="d-flex flex-wrap gap-2 bg-light rounded prescibe-by-area symtom-tag-area">
                    {selectedTest_names.map((test_name) => (
                      <span
                        key={test_name.id}
                        className="d-inline-flex align-items-center"
                        style={{
                          backgroundColor: "#e9ecef",
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "14px",
                        }}
                      >
                        {test_name.description}
                        <button
                          type="button"
                          onClick={() => removeTest_name(test_name.id)}
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

                  {showTest_namesList && (
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
                            placeholder="Search or add new test_name"
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
                        {test_names
                          .filter(
                            (t) =>
                              t.description
                                .toLowerCase()
                                .includes(newTag.toLowerCase()) &&
                              !selectedTest_names.find(
                                (selected) => selected.id === t.id
                              )
                          )
                          .map((test_name) => (
                            <button
                              key={test_name.id}
                              className="dropdown-item py-2 px-3 text-start w-100"
                              onClick={() => handleTest_nameselect(test_name)}
                            >
                              {test_name.description}
                            </button>
                          ))}
                        {isLoadingTest_names && (
                          <div className="p-3 text-center text-muted">
                            Loading test names...
                          </div>
                        )}
                        {!isLoadingTest_names &&
                          test_names.filter(
                            (t) =>
                              t.description
                                .toLowerCase()
                                .includes(newTag.toLowerCase()) &&
                              !selectedTest_names.find(
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

                {/* Error Message */}
                {formErrors.test_names && (
                  <div className="invalid-feedback d-block">
                    {formErrors.test_names}
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

export default LabReportEdit;
function setSelectedDate(arg0: Date) {
  throw new Error("Function not implemented.");
}
