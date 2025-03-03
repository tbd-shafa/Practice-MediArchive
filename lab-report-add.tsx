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
  Doctor,
} from "../../../services/PrescriptionService";
import { LabReportService, TestName } from "../../../services/LabReportService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface LabReportAddProps {
  patientId: string | string[] | undefined;
}

const LabReportAdd: FC<LabReportAddProps> = ({ patientId }) => {
  const router = useRouter();
  const [selectedDateAddLabReport, setSelectedDateAddLabReport] =
    useState<Date>(new Date());
  const handleDateAddLabReportChange = (date: Date) => {
    setSelectedDateAddLabReport(date);
    localStorage.setItem("selectedDateAddLabReport", date.toISOString()); // Store the DateAddLabReport in localStorage
  };
  const [formData, setFormData] = useState({
    prescribedBy: "",
    images: [] as string[],
    tags: [] as string[],
  });

  const [doctors, setLabReportAddDcotors] = useState<Doctor[]>([]);
  const [selectedLabReportAddDcotors, setSelectedLabReportAddDcotors] =
    useState<Doctor[]>([]);
  const [showLabReportAddDcotorsList, setShowLabReportAddDcotorsList] =
    useState(false);
  const [newLabReportAddDcotor, setNewLabReportAddDcotor] = useState("");
  const [isLoadingLabReportAddDcotors, setIsLoadingLabReportAddDcotors] =
    useState(true);
  const [isSelfSelected, setIsSelfSelected] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [testNames, setTestNames] = useState<TestName[]>([]);
  const [selectedTestNames, setSelectedTestNames] = useState<TestName[]>([]);
  const [showTestNamesList, setShowTestNamesList] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTestNames, setIsLoadingTestNames] = useState(true);

  const [isSelfChecked, setIsSelfChecked] = useState(false);

  const handleCheckboxChange = (e) => {
    setIsSelfChecked(e.target.checked);
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoadingLabReportAddDcotors(true); // Set loading to true
      try {
        const response = await PrescriptionService.getDoctors();
        if (response.status === "success") {
          setLabReportAddDcotors(response.data);
        }
      } catch (error) {
        console.error("Error fetching LabReportAddDcotors:", error);
        toast.error("Failed to fetch LabReportAddDcotors");
      } finally {
        setIsLoadingLabReportAddDcotors(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    // Check if Self is present in selectedLabReportAddDcotors
    const hasSelfDoctor = selectedLabReportAddDcotors.some(
      (doctor) => doctor.name === "Self"
    );
    setIsSelfSelected(hasSelfDoctor);
  }, [selectedLabReportAddDcotors]);

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
      setSelectedLabReportAddDcotors([selfDoctor]);
      localStorage.setItem(
        "selectedLabReportAddDcotors",
        JSON.stringify([selfDoctor])
      );
    } else {
      // Remove Self doctor when checkbox is unchecked
      setSelectedLabReportAddDcotors([]);
      localStorage.setItem(
        "selectedLabReportAddDcotors",
        JSON.stringify([])
      );
    }
  };

  const handleLabReportAddDcotorSelect = (doctor: Doctor) => {
    // If selecting a doctor, uncheck Self
    setIsSelfSelected(false);
    
    const updatedLabReportAddDcotors = [doctor];
    setSelectedLabReportAddDcotors(updatedLabReportAddDcotors);

    // Store selected LabReportAddDcotors in localStorage
    localStorage.setItem(
      "selectedLabReportAddDcotors",
      JSON.stringify(updatedLabReportAddDcotors)
    );

    setShowLabReportAddDcotorsList(false);
    setNewLabReportAddDcotor("");
  };

  const handleAddNewLabReportAddDcotor = async () => {
    if (!newLabReportAddDcotor.trim()) return;

    try {
      const response = await PrescriptionService.createDoctor(
        newLabReportAddDcotor
      );
      if (response.status === "success" && response.data) {
        const newLabReportAddDcotorData = {
          id: response.data.id,
          name: response.data.name,
          client_id: response.data.client_id,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
        };
        setLabReportAddDcotors((prev) => [...prev, newLabReportAddDcotorData]);

        const updatedLabReportAddDcotors = [newLabReportAddDcotorData];
        setSelectedLabReportAddDcotors(updatedLabReportAddDcotors);

        // Store selected LabReportAddDcotors in localStorage
        localStorage.setItem(
          "selectedLabReportAddDcotors",
          JSON.stringify(updatedLabReportAddDcotors)
        );

        setShowLabReportAddDcotorsList(false);
        setNewLabReportAddDcotor("");
      }
    } catch (error) {
      console.error("Error adding new LabReportAddDcotor:", error);
    }
  };

  useEffect(() => {
    const storedLabReportAddDcotors = localStorage.getItem(
      "selectedLabReportAddDcotors"
    );
    if (storedLabReportAddDcotors) {
      try {
        const parsedLabReportAddDcotors = JSON.parse(storedLabReportAddDcotors);
        setSelectedLabReportAddDcotors(parsedLabReportAddDcotors);
      } catch (error) {
        console.error("Error parsing stored LabReportAddDcotors:", error);
      }
    }
  }, []);

  const removeLabReportAddDcotor = (doctorId: number) => {
    setSelectedLabReportAddDcotors((prev) =>
      prev.filter((doc) => doc.id !== doctorId)
    );
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

      // Check if the route does NOT have both view=add and tab=lab-report
      const isNotLabReportAddPage = view !== "add" || tab !== "lab-report";

      if (isNotLabReportAddPage) {
        // Clear localStorage
        localStorage.removeItem("labReportImages");
        localStorage.removeItem("selectedTestNames");
        localStorage.removeItem("selectedLabReportAddDcotors");
        localStorage.removeItem("selectedDateAddLabReport"); // Clear the selected DateAddLabReport
        // Reset state
        setSelectedTestNames([]);
        setUploadedFiles([]);
        setSelectedLabReportAddDcotors([]);
        setSelectedDateAddLabReport(new Date()); // Reset to today's DateAddLabReport if desired
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
      localStorage.setItem("labReportImages", JSON.stringify(updatedImages));

      return {
        ...prev,
        images: updatedImages,
      };
    });
  };

  // On component mount, load images from localStorage
  useEffect(() => {
    const storedImages = localStorage.getItem("labReportImages");
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
    localStorage.removeItem("labReportImages");
  };

  const handleTestNameSelect = (testName: TestName) => {
    const updatedTestNames = [...selectedTestNames, testName].filter(
      (t, index, self) => index === self.findIndex((st) => st.id === t.id)
    );

    setSelectedTestNames(updatedTestNames);

    // Store in localStorage
    localStorage.setItem("selectedTestNames", JSON.stringify(updatedTestNames));

    setShowTestNamesList(false);
    setNewTestName("");
  };

  // Modify removeTestName to update localStorage
  const removeTestName = (testNameId: number) => {
    const updatedTestNames = selectedTestNames.filter(
      (t) => t.id !== testNameId
    );

    setSelectedTestNames(updatedTestNames);

    // Update localStorage
    localStorage.setItem("selectedTestNames", JSON.stringify(updatedTestNames));
  };

  // On component mount, load test names from localStorage
  useEffect(() => {
    const storedTestNames = localStorage.getItem("selectedTestNames");
    if (storedTestNames) {
      try {
        const parsedTestNames = JSON.parse(storedTestNames);
        setSelectedTestNames(parsedTestNames);
      } catch (error) {
        console.error("Error parsing stored test names:", error);
      }
    }
  }, []);

  const handleAddNewTestName = async () => {
    if (!newTestName.trim()) return;

    try {
      const response = await LabReportService.createTestName(
        newTestName.trim()
      );
      if (response.status === "success" && response.data) {
        setTestNames((prev) => [...prev, response.data]);
        handleTestNameSelect(response.data);
        toast.success("Test name added successfully");
      }
    } catch (error) {
      console.error("Error adding new test name:", error);
      toast.error("Failed to add new test name");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    let hasError = false;
    const errors: { [key: string]: string } = {};

    if (!selectedDateAddLabReport) {
      errors.date = "Date is required";
      hasError = true;
    }

    if (!isSelfSelected && selectedLabReportAddDcotors.length === 0) {
      errors.doctor = "Doctor is required";
      hasError = true;
    }
    if (selectedTestNames.length === 0) {
      errors.testNames = "At least one test name is required";
      hasError = true;
    }

    if (uploadedFiles.length === 0) {
      errors.images = "At least one image is required";
      hasError = true;
    }

    if (hasError) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const doctorId = isSelfSelected ? 0 : selectedLabReportAddDcotors[0].id;
      const doctorName = isSelfSelected
        ? "Self"
        : selectedLabReportAddDcotors[0].name;

      const response = await LabReportService.createLabReport(
        patientId as string,
        doctorId,
        doctorName,
        format(selectedDateAddLabReport, "yyyy-MM-dd"),
        selectedTestNames.map((t) => t.id),
        uploadedFiles
      );

      if (response.status === "success") {
        localStorage.removeItem("labReportImages");
        localStorage.removeItem("selectedTestNames");
        localStorage.removeItem("selectedLabReportAddDcotors");
        localStorage.removeItem("selectedDateAddLabReport"); // Clear the selected DateAddLabReport
        // Reset state
        setSelectedTestNames([]);
        setUploadedFiles([]);
        setSelectedLabReportAddDcotors([]);
        setSelectedDateAddLabReport(new Date()); // Reset to today's DateAddLabReport if desired
        toast.success("Lab report added successfully");

        setTimeout(() => {
          router.push(`/view-patient/${patientId}?tab=lab-report`);
        }, 1000);
      } else {
        toast.error(response.message || "Failed to add lab report");
      }
    } catch (error: any) {
      console.error("Error adding lab report:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add lab report. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Slick settings
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
        tab: "lab-report",
        imageAttachment: "true",
      },
    });
  };
  const navigateToAddTags = () => {
    router.push({
      pathname: `/view-patient/${patientId}`,
      query: {
        ...router.query,
        view: "add",
        tab: "lab-report",
        addTags: "true",
      },
    });
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
            localStorage.getItem("labReportImages") || "[]"
          );

          // Filter out duplicate images
          const newImages = parsedImages.filter(
            (newImage: string) => !currentImages.includes(newImage)
          );

          const updatedImages = [...currentImages, ...newImages];

          // Update localStorage
          localStorage.setItem(
            "labReportImages",
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
      localStorage.getItem("labReportImages") || "[]"
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

  useEffect(() => {
    const { selectedTestNames } = router.query;

    if (selectedTestNames) {
      try {
        const parsedTestNames = JSON.parse(selectedTestNames as string);

        // Combine with existing localStorage test names
        const existingTestNames = JSON.parse(
          localStorage.getItem("selectedTestNames") || "[]"
        );

        const combinedTestNames = [
          ...existingTestNames,
          ...parsedTestNames.filter(
            (newTest: TestName) =>
              !existingTestNames.some(
                (existingTest: TestName) => existingTest.id === newTest.id
              )
          ),
        ];

        // Update localStorage and state
        localStorage.setItem(
          "selectedTestNames",
          JSON.stringify(combinedTestNames)
        );
        setSelectedTestNames(combinedTestNames);

        // Remove selectedTestNames from query to prevent re-adding
        router.replace(
          {
            pathname: router.pathname,
            query: { ...router.query, selectedTestNames: undefined },
          },
          undefined,
          { shallow: true }
        );
      } catch (error) {
        console.error("Error parsing selected test names:", error);
      }
    }
  }, [router.query]);
  useEffect(() => {
    const storedDateAddLabReport = localStorage.getItem(
      "selectedDateAddLabReport"
    );
    if (storedDateAddLabReport) {
      setSelectedDateAddLabReport(new Date(storedDateAddLabReport)); // Set the stored DateAddLabReport
    }
  }, []);
  return (
    <>
      {isLoadingLabReportAddDcotors ? (
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <ToastContainer />
          <div className="patient-view-content-header">
            <h5 className="card-title">
              <span className="icon lab-report"></span> Add Lab Report
            </h5>
            <Link
              href={`/view-patient/${patientId}?tab=lab-report`}
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
                        selected={selectedDateAddLabReport}
                        //onChange={(date: Date) => setSelectedDate(date)}
                        onChange={handleDateAddLabReportChange}
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
                  {/* Prescribe by section */}
                  <div className="form-group">
                    <div className="d-flex justify-content-between align-items-center">
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
                          selectedLabReportAddDcotors.map((doctor) => (
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
                                onClick={() =>
                                  removeLabReportAddDcotor(doctor.id)
                                }
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
                        {!selectedLabReportAddDcotors.length &&
                          !isSelfSelected && (
                            <button
                              type="button"
                              onClick={() =>
                                setShowLabReportAddDcotorsList(
                                  !showLabReportAddDcotorsList
                                )
                              }
                              className="btn btn-link p-0 text-primary d-flex align-items-center"
                              style={{
                                textDecoration: "none",
                                fontSize: "14px",
                                width: "100%",
                              }}
                              disabled={isSelfSelected}
                            >
                              Doctor Name
                            </button>
                          )}
                      </div>

                      {showLabReportAddDcotorsList && !isSelfSelected && (
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
                                value={newLabReportAddDcotor}
                                onChange={(e) =>
                                  setNewLabReportAddDcotor(e.target.value)
                                }
                                className="form-control form-control-sm"
                                placeholder="Search or add new doctor"
                                autoFocus
                                style={{ maxHeight: 45, fontWeight: 400 }}
                                disabled={isSelfSelected}
                              />
                              {newLabReportAddDcotor && (
                                <button
                                  className="add-new-btn"
                                  onClick={handleAddNewLabReportAddDcotor}
                                  style={{
                                    height: 45,
                                    padding: 0,
                                    paddingRight: 10,
                                  }}
                                  disabled={isSelfSelected}
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
                                    .includes(
                                      newLabReportAddDcotor.toLowerCase()
                                    ) &&
                                  !selectedLabReportAddDcotors.find(
                                    (selected) => selected.id === d.id
                                  )
                              )
                              .map((doctor) => (
                                <button
                                  key={doctor.id}
                                  className="dropdown-item py-2 px-3 text-start w-100"
                                  onClick={() =>
                                    handleLabReportAddDcotorSelect(doctor)
                                  }
                                  disabled={isSelfSelected}
                                >
                                  {doctor.name}
                                </button>
                              ))}
                            {isLoadingLabReportAddDcotors && (
                              <div className="p-3 text-center text-muted">
                                Loading doctors...
                              </div>
                            )}
                            {!isLoadingLabReportAddDcotors &&
                              doctors.filter(
                                (d) =>
                                  d.name
                                    .toLowerCase()
                                    .includes(
                                      newLabReportAddDcotor.toLowerCase()
                                    ) &&
                                  !selectedLabReportAddDcotors.find(
                                    (selected) => selected.id === d.id
                                  )
                              ).length === 0 && (
                                <div className="p-3 text-center text-muted">
                                  {newLabReportAddDcotor
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
                        formErrors.testNames ? "is-invalid" : ""
                      }`}
                    >
                      <div className="d-flex flex-wrap gap-2 bg-light rounded prescibe-by-area symtom-tag-area">
                        {selectedTestNames.map((testName) => (
                          <span
                            key={testName.id}
                            className="d-inline-flex align-items-center"
                            style={{
                              backgroundColor: "#e9ecef",
                              padding: "4px 12px",
                              borderRadius: "16px",
                              fontSize: "14px",
                            }}
                          >
                            {testName.description}
                            <button
                              type="button"
                              onClick={() => removeTestName(testName.id)}
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

                      {showTestNamesList && (
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
                                value={newTestName}
                                onChange={(e) => setNewTestName(e.target.value)}
                                className="form-control form-control-sm"
                                placeholder="Search or add new test name"
                                autoFocus
                              />
                              {newTestName && (
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={handleAddNewTestName}
                                >
                                  <FontAwesomeIcon icon={faPlus} />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="test-name-list">
                            {testNames
                              .filter(
                                (t) =>
                                  t.description
                                    .toLowerCase()
                                    .includes(newTestName.toLowerCase()) &&
                                  !selectedTestNames.find(
                                    (selected) => selected.id === t.id
                                  )
                              )
                              .map((testName) => (
                                <button
                                  key={testName.id}
                                  className="dropdown-item py-2 px-3 text-start w-100"
                                  onClick={() => handleTestNameSelect(testName)}
                                >
                                  {testName.description}
                                </button>
                              ))}
                            {isLoadingTestNames && (
                              <div className="p-3 text-center text-muted">
                                Loading test names...
                              </div>
                            )}
                            {!isLoadingTestNames &&
                              testNames.filter(
                                (t) =>
                                  t.description
                                    .toLowerCase()
                                    .includes(newTestName.toLowerCase()) &&
                                  !selectedTestNames.find(
                                    (selected) => selected.id === t.id
                                  )
                              ).length === 0 && (
                                <div className="p-3 text-center text-muted">
                                  {newTestName
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

            <div className="text-center mt-4 save-btn-area">
              <button type="submit" className="" disabled={isSaving}>
                {isSaving ? "SAVING..." : "SAVE"}
              </button>
            </div>
          </form>
        </>
      )}
    </>
  );
};

export default LabReportAdd;
