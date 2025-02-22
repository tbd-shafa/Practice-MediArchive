import { FC, useEffect, useRef, useState } from "react";
import { ImageZoomHandler } from "../../public/js/prescription";
import { PrescriptionService } from "../services/PrescriptionService";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { LabReportService } from "../services/LabReportService";

interface ImageZoomModalLabProps {
  imageUrl: string;

  //images: { image_url: string }[];
  images: {
    [x: string]: any;
    image_url: string;
  }[];
  selectedIndex: number;
  onClose: () => void;
  labReportId: number;
  patientId: string | number;
  fromNoteView?: boolean;
  noteId?: number;
}

interface Image {
  id: number; // Add id property
  image_url: string;
}

const ImageZoomModalLab: FC<ImageZoomModalLabProps> = ({
  imageUrl,
  onClose,
  labReportId,
  patientId,
  //images,
  images: initialImages,
  selectedIndex,
  fromNoteView = false,
  noteId,
}) => {
  //const [images, setImages] = useState<{ id: number; image_url: string }[]>(initialImages);
  const [images, setImages] = useState<{ id: number; image_url: string }[]>(
    initialImages.map((img, index) => ({
      id: img.id ?? index, // Use existing id or fallback to index
      image_url: img.image_url,
    }))
  );
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const zoomHandlerRef = useRef<ImageZoomHandler | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageDeleteModal, setShowImageDeleteModal] = useState(false);
  const router = useRouter();
  const [
    showDeleteModalLabReportPrescription,
    setShowDeleteModalLabReportPrescription,
  ] = useState(false);
  const handleDelete = async () => {
    try {
      const response = await LabReportService.deleteLabReport(labReportId);
      if (response.status === "success") {
        setShowDeleteModal(false);
        toast.success("LabReport Deleted successfully");

        setTimeout(() => {
          location.reload();
        }, 1500);
      }
    } catch (error) {
      toast.error("Failed to delete LabReport");
    }
  };
  const handleDeleteLabReportPrescription = async () => {
    try {
      const response = await LabReportService.deletePrescriptionFromLabReport(
        noteId,
        labReportId
      );
      if (response.status === "success") {
        setShowDeleteModalLabReportPrescription(false);
        toast.success("Prescription Deleted From LabReport successfully");

        setTimeout(() => {
          location.reload(); // Reload the page
        }, 1500);
      }
    } catch (error) {
      toast.error("Failed to delete prescription from LabReport");
    }
  };

  const handleImageDelete = async () => {
    // Check if there is only one image left
    if (images.length === 1) {
      toast.error("Sorry!..Lab report must have at least one image.");
      setShowImageDeleteModal(false);
      return; // Exit the function early
    }

    const imageIdToDelete = images[currentIndex].id;

    try {
      const result = await LabReportService.deleteLabReportImage(
        labReportId,
        imageIdToDelete.toString()
      );

      if (result.status === "success") {
        toast.success("Image deleted successfully");
        setIsImageLoading(true);
        const updatedImages = images.filter(
          (image) => image.id !== imageIdToDelete
        );
        setImages(updatedImages);

        if (updatedImages.length === 0) {
          onClose();
        } else if (currentIndex >= updatedImages.length) {
          setCurrentIndex(updatedImages.length - 1);
        }

        setShowImageDeleteModal(false);
      }
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };
  const handleClose = () => {
    setShowImageDeleteModal(false); // Close the delete modal
    location.reload(); // Close the main modal without reloading the page
  };
  const handleAddClick = (e) => {
    e.preventDefault(); // Prevent default anchor behavior

    router.push({
      pathname: `/view-patient/${patientId}`,
      query: {
        view: "addimage",
        tab: "lab-report",
        imageAttachment: "true",
        labReportId,
      },
    });
  };
  const [isImageLoading, setIsImageLoading] = useState(true);
// Add image load handler
const handleImageLoad = () => {
  setIsImageLoading(false);
};

  const handleNext = () => {
    setIsImageLoading(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setIsImageLoading(true);
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };
  const handleShareClick = () => {
    const currentImageUrl = images[currentIndex].image_url; // Get the current image URL
    navigator.clipboard
      .writeText(currentImageUrl) // Use the Clipboard API to copy the URL
      .then(() => {
        toast.success("Image URL copied to clipboard!"); // Notify the user
      })
      .catch((err) => {
        toast.error("Failed to copy image URL"); // Handle errors
        console.error("Could not copy text: ", err);
      });
  };
  useEffect(() => {
    const zoomInBtn = document.getElementById("zoomIn");
    const zoomOutBtn = document.getElementById("zoomOut");
    const resetZoomBtn = document.getElementById("resetZoom");
    const fullscreenBtn = document.getElementById("fullscreenBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const modalContainer = document.querySelector(".modal-image-container");

    // Initialize zoom handler
    zoomHandlerRef.current = new ImageZoomHandler("modalImage");

    // Add event listeners
    zoomInBtn?.addEventListener("click", () =>
      zoomHandlerRef.current?.zoomIn()
    );
    zoomOutBtn?.addEventListener("click", () =>
      zoomHandlerRef.current?.zoomOut()
    );
    resetZoomBtn?.addEventListener("click", () =>
      zoomHandlerRef.current?.resetZoom()
    );

    fullscreenBtn?.addEventListener("click", () => {
      if (modalContainer instanceof HTMLElement) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          modalContainer.requestFullscreen();
        }
      }
    });

    downloadBtn?.addEventListener("click", () => {
      const link = document.createElement("a");
      const currentImageUrl = images[currentIndex].image_url; // Get the current image URL
      console.log(`Downloading image from URL: ${currentImageUrl}`); // Log the URL
      link.href = currentImageUrl;

      const fileExtension = currentImageUrl.split(".").pop();
      link.download = `image.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    return () => {
      // Clean up event listeners
      zoomHandlerRef.current?.cleanup();
    };
  }, [images, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handlePrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        // Add zoom controls if needed
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      zoomHandlerRef.current?.cleanup();
    };
  }, [images, currentIndex]); // Add dependencies as needed
  return (
    <>
      <ToastContainer />

      <div id="imageModal" className="modal" style={{ display: "block" }}>
        <div className="modal-toolbar">
          <div className="zoom-controls">
            <button id="zoomIn" title="Zoom In">
              <Image
                src="/images/zoom-in-icon.svg"
                alt="zoom-in"
                width={20}
                height={19}
              />
            </button>

            <button id="zoomOut" title="Zoom Out">
              <Image
                src="/images/zoom-out-icon.svg"
                alt="zoom-out"
                width={20}
                height={19}
              />
            </button>

            <button className="reset" id="resetZoom" title="Reset Zoom">
              <Image
                src="/images/close-icon-white-2.svg"
                alt="reset"
                width={18}
                height={17}
              />
            </button>
          </div>
          <div className="image-controls">
            {!fromNoteView && ( // Conditionally render based on the new prop
              <>
                <button
                  id="deleteBtn"
                  className="remove-btn"
                  title="Delete"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <i className="fas fa-trash"></i>
                  <Image
                    src="/images/delete-icon-white.svg"
                    alt="remove"
                    width={18}
                    height={17}
                  />
                </button>

                <button
                  id="editBtn"
                  className="edit-btn"
                  title="Edit"
                  onClick={() =>
                    router.push(
                      `/view-patient/${patientId}?tab=lab-report&view=edit&labReportId=${labReportId}`
                    )
                  }
                >
                  <Image
                    src="/images/edit-icon-white.svg"
                    alt="edit"
                    width={17}
                    height={16}
                  />
                  <span>Edit</span>
                </button>
              </>
            )}
            {fromNoteView && (
              <button
                id="deleteBtn"
                className="remove-btn"
                title="Delete"
                onClick={() => setShowDeleteModalLabReportPrescription(true)}
              >
                <i className="fas fa-trash"></i>
                <Image
                  src="/images/delete-icon-white.svg"
                  alt="remove"
                  width={18}
                  height={17}
                />
              </button>
            )}
            <button className="close" title="Close" onClick={handleClose}>
              <Image
                src="/images/close-icon-white-2.svg"
                alt="close"
                width={18}
                height={17}
              />
            </button>
          </div>
        </div>
        <div className="modal-image-container">
          <button
            id="prevButton"
            onClick={handlePrev}
            style={{ display: images.length > 1 ? "block" : "none" }}
          >
            <Image
              src="/images/chevron-left.svg"
              alt="left"
              width={24}
              height={43}
            />
          </button>
          <div className="modal-Image-container-card">
            {/* <div className="modal-Image-container">
              <img
                id="modalImage"
                src={images[currentIndex].image_url}
                alt="labReport"
                className="modal-content"
              />
            </div> */}
            <div className="modal-Image-container" style={{ position: 'relative' }}>
              {isImageLoading && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  padding: '20px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
            <img
              id="modalImage"
              src={images[currentIndex].image_url}
              alt="labReport"
              className="modal-content"
              style={{
                opacity: isImageLoading ? 0.3 : 1,
                transition: 'opacity 0.3s ease'
              }}
              onLoad={handleImageLoad}
            />
         </div>
            <div className="modal-image-action">
              <button id="fullscreenBtn">
                <span className="icon fullscreen"></span>
              </button>
              <button id="downloadBtn">
                <span className="icon download"></span>
              </button>

              <button id="shareBtn" onClick={handleShareClick}>
                <span className="icon link-share"></span>
              </button>
              {!fromNoteView && (
                <>
                  <button
                    id="removeBtn"
                    onClick={() => setShowImageDeleteModal(true)}
                  >
                    <span className="icon remove"></span>
                  </button>

                  <a href="#" id="addBtn" onClick={handleAddClick}>
                    <span>
                      <Image
                        src="/images/plus-icon.svg"
                        alt="plus"
                        width={20}
                        height={20}
                      />{" "}
                      Add
                    </span>
                  </a>
                </>
              )}
            </div>
          </div>

          <button
            id="nextButton"
            onClick={handleNext}
            style={{ display: images.length > 1 ? "block" : "none" }}
          >
            <Image
              src="/images/chevron-right.svg"
              alt="right"
              width={24}
              height={43}
            />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
                  Are you sure you <br /> want to Delete This LabReports?
                </h4>
                <h4>
                  Items That Have Been In Trash <br /> More Than 30 Days Will Be{" "}
                  <br /> Automatically Deleted
                </h4>
              </div>
              <div className="modal-footer px-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  NO KEEP THAT
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDelete}
                  data-bs-dismiss="modal"
                >
                  YES DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModalLabReportPrescription && (
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
                  Are you sure you <br /> want to Delete This LabReport From
                  Note?
                </h4>
              </div>
              <div className="modal-footer px-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModalLabReportPrescription(false)}
                >
                  NO KEEP THAT
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDeleteLabReportPrescription}
                  data-bs-dismiss="modal"
                >
                  YES DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  Are you sure you <br /> want to Delete This LabReport Image?
                </h4>
                <h4>
                  Items That Have Been In Trash <br /> More Than 30 Days Will Be{" "}
                  <br /> Automatically Deleted
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
    </>
  );
};

export default ImageZoomModalLab;
