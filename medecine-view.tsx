import { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MedicineService } from "../../../services/MedicineService";
import { MeService, GetMeResponse } from "../../../services/MeService";
import Link from "next/link";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPlus } from "@fortawesome/free-solid-svg-icons";
import { api } from "../../../services/api";
import config from "../../../config";
interface MedicineViewProps {
  patientId: string | string[] | undefined;
  medicineId: string;
}

const MedicineView: FC<MedicineViewProps> = ({ patientId, medicineId }) => {
  const router = useRouter();
  const [medicine, setMedicine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isModalOpenForUpgrade, setIsModalOpenForUpgrade] = useState(false);
 
  


  const handlePlusClick = async () => {
    try {
      const response = await MeService.getMeInfo();
      if (response.data.package.values.reminder.has_access) {
       //medicine edit/view reminder page
       router.push(`/view-patient/${patientId}?tab=medicine&view=reminder&medicineid=${medicineId}`);
      } else {
        // Open upgrade modal
        setIsModalOpenForUpgrade(true);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      // Optionally handle error, e.g., show an error message
    }
  };

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const id =
          typeof medicineId === "string"
            ? parseInt(medicineId)
            : Array.isArray(medicineId)
            ? parseInt(medicineId[0])
            : 0;
        const response = await MedicineService.getMedicine(id);
        if (response.status === "success") {
          setMedicine(response.data);
        } else {
          setError("Failed to fetch medicine details.");
        }
      } catch (err) {
        setError("Error fetching medicine details.");
      } finally {
        setLoading(false);
      }
    };

    if (medicineId) {
      fetchMedicine();
    }
  }, [medicineId]);
  const handleDelete = async () => {
    try {
      const id =
        typeof medicineId === "string"
          ? parseInt(medicineId)
          : Array.isArray(medicineId)
          ? parseInt(medicineId[0])
          : 0;
      const response = await MedicineService.deleteMedecine(id);
      if (response.status === "success") {
        toast.success("Medecine deleted successfully");
        setTimeout(() => {
          router.push(`/view-patient/${patientId}?tab=medicine`);
        }, 1500);
      }
    } catch (error) {
      toast.error("Failed to delete medecine");
    }
  };


  const handleArchive = async () => {
    try {
      const id =
        typeof medicineId === "string"
          ? parseInt(medicineId)
          : Array.isArray(medicineId)
          ? parseInt(medicineId[0])
          : 0;

      const isArchived = medicine.is_archived;
      const response = await MedicineService.archiveMedecine(id, !isArchived); // Toggle the archived status

      if (response.status === "success") {
        setMedicine((prev) => ({ ...prev, is_archived: !isArchived })); // Update the state to reflect the new archived status
        toast.success(
          `Medicine ${isArchived ? "unarchived" : "archived"} successfully`
        );
        setTimeout(() => {
          router.push(`/view-patient/${patientId}?tab=medicine`);
        }, 1500);
      }
    } catch (error) {
      toast.error(
        `Failed to ${medicine.is_archived ? "unarchive" : "archive"} medicine`
      );
    }
  };

  if (error) return <p>{error}</p>;

  return (
    <>
      {loading || !medicine ? (
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
              <span className="icon notes"></span> Medicine
            </h5>
            {/* <Link
              href="#"
              className="btn-patient-sm-add"
              onClick={() => setShowArchiveModal(true)}
            >
              Archive
            </Link> */}
            <Link
              href="#"
              className="btn-patient-sm-add"
              onClick={() => setShowArchiveModal(true)}
            >
              {medicine.is_archived ? "Unarchive" : "Archive"}
            </Link>

            <Link
              href="#"
              className="btn-patient-sm-add"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Link>
            <Link
              href={`/view-patient/${patientId}?tab=medicine`}
              className="btn-patient-sm-add"
            >
              Back
            </Link>
          </div>
          <div className="note-details">
            <div className="medicine-view">
              <h2>{medicine.name}</h2>
              <p>
                <strong>Doctor:</strong> {medicine.doctor.name}
              </p>
              <p>
                <strong>Strength:</strong> {medicine.strength}{" "}
                {medicine.medicine_unit.measurement_short}
              </p>
              <p>
                <strong>Per Day Dose:</strong> {medicine.perday_dose}
              </p>
              <p>
                <strong>Frequency:</strong> {medicine.frequency}
              </p>

              {medicine.specific_days && medicine.specific_days !== "null" ? (
                <p>
                  <strong>Specific Days:</strong> {medicine.specific_days}
                </p>
              ) : null}
              <p>
                <strong>Post Meal:</strong>{" "}
                {medicine.is_post_meal === "yes" ? "After Meal" : "Before Meal"}
              </p>

              <p>
                {medicine.reminders_count > 0 ? (
                  <>
                    <strong>Reminders:</strong> {medicine.reminders_count} times
                    a day
                    <FontAwesomeIcon 
          icon={faEye} 
          onClick={handlePlusClick}
          className="cursor-pointer"
          style={{ marginLeft: '10px', cursor: 'pointer' }}
        />
                  </>
                ) : (
                  <span>
                    Reminders:{" "}
                    <FontAwesomeIcon icon={faPlus}   style={{ cursor: 'pointer' }} onClick={handlePlusClick} />
                  </span>
                )}
              </p>
            </div>
          </div>
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
                      Your current starter package does not support this
                      feature.
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
                      className="btn btn-link text-primary fw-bold text-center d-block mt-3 pb-0 pt-1"
                    >
                      UPGRADE NOW
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
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
                      Confirm Deletion
                    </h5>
                  </div>
                  <div className="modal-body pt-5 pb-3">
                    <h4>
                      Are you sure you <br /> want to Delete This Medecine?
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
                      onClick={() => setShowDeleteModal(false)}
                    >
                      NO KEEP THAT
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleDelete}
                    >
                      YES DELETE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

       
          {showArchiveModal && (
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
                      Confirm {medicine.is_archived ? "Unarchive" : "Archive"}
                    </h5>
                  </div>
                  <div className="modal-body pt-5 pb-3">
                    <h4>
                      Are you sure you want to{" "}
                      {medicine.is_archived ? "unarchive" : "archive"} this
                      medicine?
                    </h4>
                  </div>
                  <div className="modal-footer px-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowArchiveModal(false)}
                    >
                      NO KEEP THAT
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleArchive}
                    >
                      YES {medicine.is_archived ? "Unarchive" : "Archive"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default MedicineView;
