import { FC, useState, useEffect } from "react";
import Link from "next/link";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PrescriptionService,
  Doctor,
} from "../../../services/PrescriptionService";
import { MedicineService } from "../../../services/MedicineService";
import { MeService } from "../../../services/MeService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import {} from "@fortawesome/free-solid-svg-icons";

import SuccessMedecineAddPopup from "../../../components/SuccessMedecineAddPopup";
import ReminderNotSupportPopup from "../../../components/ReminderNotSupportPopup";
interface MedecineAddProps {
  patientId: string | string[] | undefined;
}

interface MedicineType {
  value: string;
  name: string;
}

interface MedicineUnit {
  value: string;
  name: string;
}

const MedecineAdd: FC<MedecineAddProps> = ({ patientId }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<Doctor[]>([]);
  const [showDoctorsList, setShowDoctorsList] = useState(false);
  const [newDoctor, setNewDoctor] = useState("");
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [medicineTypes, setMedicineTypes] = useState<MedicineType[]>([]);
  const [medicineUnits, setMedicineUnits] = useState<MedicineUnit[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  // Define initial form state separately
  const initialFormData = {
    name: "",
    doctor_id: "",
    strength: "",
    medicine_type: "",
    medicine_unit: "",
    start_date: null as Date | null,
    end_date: null as Date | null,
    frequency: "",
    specific_days: [] as string[],
    perday_dose: "1", // Set default value for perday_dose
    perday_dose_times: [] as string[],
    is_post_meal: false,
    reminder_times: [] as string[],
    reminder_start_date: null as Date | null,
    reminder_end_date: null as Date | null,
  };
  // Use the initial state in useState
  const [formData, setFormData] = useState(initialFormData);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [addedMedicineName, setAddedMedicineName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isContinueChecked, setIsContinueChecked] = useState(true); // Set to true initially

  const handleNextStep = () => {
    const errors: { [key: string]: string } = {};

    // Validate required fields based on current step
    if (currentStep === 1) {
      if (!formData.name) errors.name = "Medicine name is required";
      if (!formData.strength) errors.strength = "Strength is required";
      if (!formData.medicine_type)
        errors.medicine_type = "Medicine type is required";
      if (!formData.medicine_unit)
        errors.medicine_unit = "Medicine unit is required";
      if (selectedDoctors.length === 0)
        errors.doctor = "doctor must be add or selected"; // Check for doctor selection
    } else if (currentStep === 2) {
      if (!formData.start_date) errors.start_date = "Start date is required";
      if (!formData.frequency) errors.frequency = "Frequency is required";
    } else if (currentStep === 3) {
      if (!formData.perday_dose && formData.perday_dose !== "1")
        errors.perday_dose = "Perday dose is required";
      if (formData.is_post_meal === undefined)
        errors.is_post_meal = "Meal time is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return; // Prevent moving to the next step if there are errors
    }

    setCurrentStep(currentStep + 1); // Move to the next step if no errors
  };

  useEffect(() => {
    const fetchDoctors = async () => {
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
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchMedicineData = async () => {
      setIsLoading(true); // Set loading to true
      try {
        const response = await MedicineService.getMedicineTypesAndUnits();
        if (response.status === "success") {
          // setFormData((prev) => ({
          //   ...prev,
          //   medicine_type: response.data.medicine_types[0]?.value || "",
          //   medicine_unit: response.data.medicine_units[0]?.value || "",
          // }));
          setMedicineTypes(response.data.medicine_types);
          setMedicineUnits(response.data.medicine_units);
          setFormData((prev) => ({
            ...prev,
            medicine_type: "", // Set to empty string for no initial selection
            medicine_unit:  "",
          }));
        }
      } catch (error) {
        console.error("Error fetching medicine data:", error);
      } finally {
        setIsLoading(false); // Set loading to false
      }
    };

    fetchMedicineData();
  }, []);

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctors([doctor]);
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
        setSelectedDoctors([newDoctorData]);
        setShowDoctorsList(false);
        setNewDoctor("");
      }
    } catch (error) {
      console.error("Error adding new doctor:", error);
      toast.error("Failed to add new doctor");
    }
  };

  const removeDoctor = (doctorId: number) => {
    setSelectedDoctors([]);
  };

  const handleNavigation = (direction: "next" | "back") => {
    if (direction === "next") {
      handleNextStep();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const [isModalOpenForUpgrade, setIsModalOpenForUpgrade] = useState(false);
  const handleClick = async () => {
    try {
      const response = await MeService.getMeInfo();
      if (response.data.package.values.reminder.has_access) {
        // Proceed to step 4
        handleNextStep();
      } else {
        // Open upgrade modal
        setIsModalOpenForUpgrade(true);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      // Optionally handle error, e.g., show an error message
    }
  };
  // Inside MedecineAdd.tsx

  const resetFormAndGoToStep1 = () => {
    setFormData(initialFormData); // Reset form using the initial state
    setCurrentStep(1); // Reset to step 1
    setIsContinueChecked(true); // Ensure "Continue" checkbox is unchecked
    setSelectedDoctors([]); // Clear selected doctor(s)
    setShowSuccessPopup(false); // Close the popup
    location.reload();
  };

  const createSubmitData = () => {
    return {
      patient_id:
        typeof patientId === "string"
          ? patientId
          : Array.isArray(patientId)
          ? patientId[0]
          : "",
      name: formData.name,
      strength: formData.strength,
      medicine_type: formData.medicine_type,
      medicine_unit: formData.medicine_unit,
      start_date: formData.start_date
        ? format(formData.start_date, "yyyy-MM-dd")
        : "",

      end_date: isContinueChecked
        ? ""
        : formData.end_date
        ? format(formData.end_date, "yyyy-MM-dd")
        : "",
      frequency: formData.frequency,
      specific_days: formData.specific_days.join(","),
      perday_dose: formData.perday_dose,
      perday_dose_times: formData.perday_dose_times.join(", "),
      is_post_meal: formData.is_post_meal,
      doctor_id: selectedDoctors[0]?.id || "",
      doctor: selectedDoctors[0]?.name || "",
      reminder_start_date: formData.reminder_start_date
        ? format(formData.reminder_start_date, "yyyy-MM-dd")
        : "",
      reminder_end_date: formData.reminder_end_date
        ? format(formData.reminder_end_date, "yyyy-MM-dd")
        : "",
      reminder_times: formData.reminder_times.join(","),
    };
  };

  return (
    <>
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <ToastContainer />
          {showSuccessPopup && (
            <SuccessMedecineAddPopup
              medicineName={addedMedicineName}
              patientId={patientId} // Pass the patientId here
              onClose={() => setShowSuccessPopup(false)}
              onAddAnother={resetFormAndGoToStep1} // Pass the function
            />
          )}
          <div className="patient-view-content-header">
            <h5 className="card-title">
              <span className="icon medicine"></span> Add Medicine
            </h5>
            <Link
              href={`/view-patient/${patientId}?tab=medicine`}
              className="btn-patient-sm-add close-btn"
            >
              Cancel
            </Link>
          </div>

          <form>
            <div className="add-patient-from-card add-medicine-area">
              <div className="row">
                {currentStep === 1 && (
                  <>
                    <div className="col-md-12 mb-4">
                      <div className="form-group medicine-name-area">
                        <div className="left-input">
                          <Image
                            src="/images/medicine-icon.svg"
                            width={22}
                            height={22}
                            alt="icon"
                          />
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Medicine name"
                            name="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="right-cion">
                        
                           <Image
                              src={
                                formData.medicine_type
                                  ? `/images/medicine_type/${medicineTypes.find((type) => type.value === formData.medicine_type)?.name.toLowerCase()}.png`
                                  : "/images/placeholder-medi-type.svg"
                              }
                              width={36}
                              height={36}
                              alt="icon"
                            />
                        </div>
                      </div>
                      {formErrors.name && (
                        <div className="invalid-feedback d-block">
                          {formErrors.name}
                        </div>
                      )}
                    </div>
                    <div className="col-md-12 mb-4">
                      <div className="form-group">
                        <Image
                          src="/images/medicine-icon.svg"
                          width={22}
                          height={22}
                          alt="icon"
                        />
                        <select
                          className="form-select"
                          name="medicine_type"
                          value={formData.medicine_type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              medicine_type: e.target.value,
                            })
                          }
                        >
                           <option value="" disabled>
                            Group
                          </option>{" "}
                          {/* Placeholder option */}
                          {medicineTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formErrors.medicine_type && (
                        <div className="invalid-feedback d-block">
                          {formErrors.medicine_type}
                        </div>
                      )}
                    </div>

                    <div className="col-md-12 mb-4">
                      <div className="form-group">
                        <Image
                          src="/images/medicine-icon.svg"
                          width={22}
                          height={22}
                          alt="icon"
                        />
                        <input
                          type="number"
                          className="form-control"
                          placeholder="500"
                          name="strength"
                          value={formData.strength}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              strength: e.target.value,
                            })
                          }
                        />
                      </div>
                      {formErrors.strength && (
                        <div className="invalid-feedback d-block">
                          {formErrors.strength}
                        </div>
                      )}
                    </div>

                    <div className="col-md-12 mb-4">
                      <div className="form-group">
                        <Image
                          src="/images/power.svg"
                          width={22}
                          height={22}
                          alt="icon"
                        />
                        <select
                          className="form-select"
                          name="medicine_unit"
                          value={formData.medicine_unit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              medicine_unit: e.target.value,
                            })
                          }
                        >
                          <option value="" disabled>
                            Unit
                          </option>{" "}
                          {medicineUnits.map((unit) => (
                            <option key={unit.value} value={unit.value}>
                              {unit.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formErrors.medicine_unit && (
                        <div className="invalid-feedback d-block">
                          {formErrors.medicine_unit}
                        </div>
                      )}
                    </div>

                    <div className="col-md-12 mb-4">
                      <div className="form-group">
                        <Image
                          src="/images/stetiscope.svg"
                          width={22}
                          height={22}
                          alt="icon"
                        />
                        <div
                          className={`w-100 position-relative ${
                            formErrors.doctor ? "is-invalid" : ""
                          }`}
                        >
                          <div className="prescribe-full-area">
                            {selectedDoctors.map((doctor) => (
                              <span
                                key={doctor.id}
                                className="d-inline-flex align-items-center"
                              >
                                {doctor.name}
                                <button
                                  type="button"
                                  onClick={() => removeDoctor(doctor.id)}
                                  className="btn btn-link p-0 ms-2"
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
                                onClick={() =>
                                  setShowDoctorsList(!showDoctorsList)
                                }
                                className="prescripbe_by_btn"
                              >
                                Prescribe by
                                <FontAwesomeIcon
                                  icon={faChevronDown}
                                  className="dropdown-icon"
                                />
                              </button>
                            )}
                          </div>

                          {showDoctorsList && (
                            <div
                              className="custom-scrol position-absolute w-100 bg-white border rounded shadow-sm"
                              style={{
                                zIndex: 1000,
                                maxHeight: "200px",
                                overflowY: "auto",
                              }}
                            >
                              <div className="border-bottom presc-doct-add-area">
                                <div className="input-group">
                                  <input
                                    type="text"
                                    value={newDoctor}
                                    onChange={(e) =>
                                      setNewDoctor(e.target.value)
                                    }
                                    className="form-control form-control-sm"
                                    placeholder="Search or add new doctor"
                                    autoFocus
                                  />
                                  {newDoctor && (
                                    <button
                                      className="add-new-btn"
                                      onClick={handleAddNewDoctor}
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
                                        ? "Press + Add to add new doctor"
                                        : "No doctors available"}
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {formErrors.doctor && (
                        <div className="invalid-feedback d-block">
                          {formErrors.doctor}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="col-md-12 mb-4">
                      <div className="form-group">
                        <Image
                          src="/images/start-end-date.svg"
                          width={22}
                          height={22}
                          alt="icon"
                        />
                        <DatePicker
                          selected={formData.start_date}
                          onChange={(date: Date) =>
                            setFormData({ ...formData, start_date: date })
                          }
                          className="form-control w-100"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Start date"
                          name="start_date"
                        />
                      </div>
                      {formErrors.start_date && (
                        <div className="invalid-feedback d-block">
                          {formErrors.start_date}
                        </div>
                      )}
                    </div>
                    <div className="col-md-12 mb-2">
                      <div
                        className={`form-group end-date ${
                          isContinueChecked ? "disabled" : ""
                        }`}
                      >
                        <Image
                          src="/images/start-end-date.svg"
                          width={22}
                          height={22}
                          alt="icon"
                        />
                        <DatePicker
                          selected={formData.end_date}
                          onChange={(date: Date) =>
                            setFormData({ ...formData, end_date: date })
                          }
                          className="form-control w-100"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="End date"
                          name="end_date"
                          minDate={formData.start_date || new Date()}
                          disabled={isContinueChecked}
                        />
                      </div>
                    </div>
                    <div className="col-md-12 mb-4">
                      <div className="continue-btn-area">
                        <div className="d-flex align-items-center justify-content-end">
                          <label htmlFor="continueSwitch">Continue</label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="continueSwitch"
                              checked={isContinueChecked}
                              onChange={(e) => {
                                setIsContinueChecked(e.target.checked);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-12 mb-4">
                      <div className="form-group">
                        <Image
                          src="/images/frequency-icon.svg"
                          width={22}
                          height={22}
                          alt="icon"
                        />
                        <select
                          className="form-select"
                          name="frequency"
                          value={formData.frequency}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              frequency: e.target.value,
                            })
                          }
                        >
                          <option value="">Select frequency</option>
                          <option value="daily">Daily</option>
                          <option value="every_alternative_day">
                            Every Alternative Day
                          </option>
                          <option value="specific_day">Specific Day</option>
                        </select>
                      </div>
                      {formErrors.frequency && (
                        <div className="invalid-feedback d-block">
                          {formErrors.frequency}
                        </div>
                      )}
                    </div>
                   
                    {formData.frequency === "specific_day" && (
                      <div className="col-md-12 mb-4">
                        <div className="specific-day">
                          <label>
                            <Image src="/images/specific-day.svg" width={22} height={22} alt="icon" />{" "}
                            Which days?
                          </label>
                          <div className="specific-days-list">
                            {[
                              "Saturday", 
                              "Sunday", 
                              "Monday", 
                              "Tuesday", 
                              "Wednesday", 
                              "Thursday", 
                              "Friday"
                            ].map(
                              (day, index) => {
                                const checkboxId = `day-${index}`; // Unique ID for each checkbox
                                return (
                                  <label 
                                    key={day} 
                                    htmlFor={checkboxId} 
                                    className="d-flex align-items-center justify-content-between p-2 border-bottom cursor-pointer"
                                  >
                                    <span>{day}</span> {/* Clickable Label */}
                                    <input
                                      type="checkbox"
                                      id={checkboxId}
                                      checked={formData.specific_days.includes(day)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setFormData({
                                            ...formData,
                                            specific_days: [...formData.specific_days, day],
                                          });
                                        } else {
                                          setFormData({
                                            ...formData,
                                            specific_days: formData.specific_days.filter((d) => d !== day),
                                          });
                                        }
                                      }}
                                      className="form-check-input"
                                    />
                                  </label>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="col-md-12 mb-4">
                      <div className="form-group">
                        {/* <label>How many times</label> */}
                        <Image
                          src="/images/spefic-times-icon.svg"
                          width={22}
                          height={22}
                          alt="icon"
                        />
                        <select
                          className="form-select"
                          name="perday_dose"
                          value={formData.perday_dose}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData({
                              ...formData,
                              perday_dose: value,
                              perday_dose_times: Array(
                                parseInt(value) || 0
                              ).fill(""),
                            });
                          }}
                        >
                          <option value="1">1 time</option>
                          <option value="2">2 times</option>
                          <option value="3">3 times</option>
                          <option value="4">4 times</option>
                          <option value="0">Specific_times</option>
                        </select>
                        {formErrors.perday_dose && (
                          <div className="invalid-feedback d-block">
                            {formErrors.perday_dose}
                          </div>
                        )}
                      </div>
                    </div>

                     {formData.perday_dose === "0" && (
                      <div className="col-md-12 mb-4 mt-3">
                        <label className="d-flex align-items-center gap-2">
                          <Image
                            src="/images/frequency-icon.svg"
                            width={22}
                            height={22}
                            alt="icon"
                          />{" "}
                          Set Times
                        </label>
                        <div className="px-3">
                          <div className="specific-times-list set-specf-time">
                            <div className="item d-flex align-items-center mt-0">
                              <input
                                type="text"
                                className="form-control time-picker"
                                placeholder="Choose time"
                                value={formData.perday_dose_times[0] || ""}
                                onClick={(e) => {
                                  const input = e.target as HTMLInputElement;
                                  input.type = "time";
                                  input.showPicker();
                                }}
                                onBlur={(e) => {
                                  const input = e.target as HTMLInputElement;
                                  if (!input.value) {
                                    input.type = "text";
                                  }
                                }}
                                onChange={(e) => {
                                  const newTimes = [...formData.perday_dose_times];
                                  newTimes[0] = e.target.value;
                                  setFormData({
                                    ...formData,
                                    perday_dose_times: newTimes,
                                  });
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-link text-danger"
                                onClick={() => {
                                  const newTimes = formData.perday_dose_times.filter((_, i) => i !== 0);
                                  setFormData({
                                    ...formData,
                                    perday_dose_times: newTimes,
                                  });
                                }}
                              >
                                <Image
                                  src="/images/minus-remove.svg"
                                  width={16}
                                  height={16}
                                  alt="icon"
                                />
                              </button>
                            </div>

                            {formData.perday_dose_times.slice(1).map((time, index) => (
                              <div
                                key={index + 1}
                                className="item d-flex align-items-center mb-0"
                              >
                                <input
                                  type="text"
                                  className="form-control time-picker"
                                  placeholder="Choose time"
                                  value={time}
                                  onClick={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    input.type = "time";
                                    input.showPicker();
                                  }}
                                  onBlur={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    if (!input.value) {
                                      input.type = "text";
                                    }
                                  }}
                                  onChange={(e) => {
                                    const newTimes = [...formData.perday_dose_times];
                                    newTimes[index + 1] = e.target.value;
                                    setFormData({
                                      ...formData,
                                      perday_dose_times: newTimes,
                                    });
                                  }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-link text-danger"
                                  onClick={() => {
                                    const newTimes = formData.perday_dose_times.filter(
                                      (_, i) => i !== index + 1
                                    );
                                    setFormData({
                                      ...formData,
                                      perday_dose_times: newTimes,
                                    });
                                  }}
                                >
                                  <Image
                                    src="/images/minus-remove.svg"
                                    width={16}
                                    height={16}
                                    alt="icon"
                                  />
                                </button>
                              </div>
                            ))}

                            <div className="d-flex justify-content-end">
                              <button
                                style={{
                                  fontSize: 16,
                                  color: "#1A72E8",
                                  textDecoration: "none",
                                  fontWeight: 700,
                                }}
                                type="button"
                                className="btn btn-link text-primary pe-0 pt-1"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    perday_dose_times: [
                                      ...formData.perday_dose_times,
                                      "",
                                    ],
                                  });
                                }}
                              >
                                + Add another time
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )} 

                    

                    <div className="col-md-12 mb-4">
                      <div className="form-group py-5">
                        <div className="meal-area w-100">
                          <p>
                            <Image
                              src="/images/meal-icon.svg"
                              width={26}
                              height={26}
                              alt="icon"
                            />{" "}
                            Meal
                          </p>
                          <div className="d-flex justify-content-between w-100 px-5">
                            <div className="form-check">
                              <input
                                type="radio"
                                className="form-check-input"
                                name="meal_time"
                                id="beforeMeal"
                                checked={!formData.is_post_meal}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    is_post_meal: false,
                                  })
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor="beforeMeal"
                              >
                                Before Meal
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                type="radio"
                                className="form-check-input"
                                name="meal_time"
                                id="afterMeal"
                                checked={formData.is_post_meal}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    is_post_meal: true,
                                  })
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor="afterMeal"
                              >
                                After Meal
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12 mb-4">
                      <div className="set-reminder-btn-area">
                        <button
                          type="button"
                          className="set-rem-btn"
                          onClick={() => setShowPopup(true)}
                        >
                          <div className="left">
                            <Image
                              src="/images/set-reminder-time-icon.svg"
                              width={22}
                              height={22}
                              alt="icon"
                            />
                            <span>Set reminder time</span>
                          </div>
                          <Image
                            src="/images/right-chevron-down.svg"
                            width={24}
                            height={24}
                            alt="icon"
                          />
                        </button>
                      </div>
                    </div>

                    {showPopup && (
                      <ReminderNotSupportPopup
                        onClose={() => setShowPopup(false)}
                        onAddAnother={() => console.log("Adding another")}
                      >
                        <div
                          style={{
                            marginTop: "20px",
                            fontSize: "14px",
                            color: "#555",
                          }}
                        >
                          Need help? Contact support.
                        </div>
                      </ReminderNotSupportPopup>
                    )}

                    {/* <div className="col-md-12 mb-4">
                      <div className="form-group set-reminder-btn-area">
                        <Image src="/images/set-reminder-time-icon.svg" width={22} height={22} alt="icon" />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="set reminder time"
                          style={{ cursor: "pointer" }}
                          onClick={handleClick}
                        />
                        <Image src="/images/right-chevron-down.svg" width={24} height={24} alt="icon" />
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
                                <h5
                                  className="modal-title"
                                  id="exampleModalLabel"
                                >
                                  Upgrade Required
                                </h5>
                              </div>
                              <div className="modal-body pt-5 pb-3">
                                <h4>
                                  Your current starter package does not support
                                  this feature.
                                </h4>
                              </div>
                              <div className="modal-footer px-4">
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() =>
                                    setIsModalOpenForUpgrade(false)
                                  } // Close the modal
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
                    </div> */}
                  </>
                )}

                {currentStep === 4 && (
                  <>
                    <div className="col-md-12 mb-4">
                      <div className="form-group">
                        <label>Reminder Start Date</label>
                        <DatePicker
                          selected={formData.reminder_start_date}
                          onChange={(date: Date) =>
                            setFormData({
                              ...formData,
                              reminder_start_date: date,
                            })
                          }
                          className="form-control"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="YYYY-MM-DD"
                          name="reminder_start_date"
                        />
                      </div>
                    </div>

                    <div className="col-md-12 mb-4">
                      <div className="form-group">
                        <label>Reminder End Date</label>
                        <DatePicker
                          selected={formData.reminder_end_date}
                          onChange={(date: Date) =>
                            setFormData({
                              ...formData,
                              reminder_end_date: date,
                            })
                          }
                          className="form-control"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="YYYY-MM-DD"
                          name="reminder_end_date"
                          minDate={formData.reminder_start_date || new Date()}
                        />
                      </div>
                    </div>

                    <div className="col-md-12 mb-4">
                      <div className="form-group">
                        <label>Set Reminder Times</label>
                        <div className="specific-times-list">
                          {formData.reminder_times.map((time, index) => (
                            <div
                              key={index}
                              className="d-flex align-items-center mb-2"
                            >
                              <input
                                type="time"
                                className="form-control"
                                value={time}
                                onChange={(e) => {
                                  const newTimes = [...formData.reminder_times];
                                  newTimes[index] = e.target.value;
                                  setFormData({
                                    ...formData,
                                    reminder_times: newTimes,
                                  });
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-link text-danger ms-2"
                                onClick={() => {
                                  const newTimes =
                                    formData.reminder_times.filter(
                                      (_, i) => i !== index
                                    );
                                  setFormData({
                                    ...formData,
                                    reminder_times: newTimes,
                                  });
                                }}
                              >
                                <i className="fas fa-minus-circle">remove</i>
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            className="btn btn-link text-primary"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                reminder_times: [
                                  ...formData.reminder_times,
                                  "",
                                ],
                              });
                            }}
                          >
                            + Add another time
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="text-center add-medicine-next-btn">
              {(currentStep === 2 ||
                currentStep === 3 ||
                currentStep === 4) && (
                <button
                  type="button"
                  className="btn btn-secondary back-btn"
                  onClick={() => handleNavigation("back")}
                >
                  <svg
                    className="arrow me-3"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      id="Icon_material-arrow-forward"
                      data-name="Icon material-arrow-forward"
                      d="M18,6,15.885,8.115l8.37,8.385H6v3H24.255l-8.37,8.385L18,30,30,18Z"
                      transform="translate(30 30) rotate(180)"
                      fill="#fff"
                    />
                  </svg>
                  BACK
                </button>
              )}
              <div className="d-flex justify-content-end w-100">
                <button
                  type="button"
                  className={`btn btn-primary next-save-btn ${
                    currentStep === 3 ? "px-0" : ""
                  }`}
                  onClick={async () => {
                    if (currentStep === 3) {
                      // Save data without going to step 4
                      try {
                        setIsSaving(true);
                        const submitData = createSubmitData(); // Call the function to create submit data

                        const response = await MedicineService.saveMedicine(
                          submitData
                        );

                        if (response.status === "success") {
                          setAddedMedicineName(formData.name); // Set the medicine name
                          setShowSuccessPopup(true); // Show the popup
                        }
                      } catch (error) {
                        console.error("Error saving medicine:", error);
                        toast.error("Failed to save medicine");
                      } finally {
                        setIsSaving(false);
                      }
                    } else if (currentStep === 4) {
                      // Proceed to save reminder data
                      try {
                        setIsSaving(true);
                        const submitData = createSubmitData(); // Call the function to create submit data

                        const response = await MedicineService.saveMedicine(
                          submitData
                        );

                        if (response.status === "success") {
                          setAddedMedicineName(formData.name); // Set the medicine name
                          setShowSuccessPopup(true); // Show the popup
                        }
                      } catch (error) {
                        console.error("Error saving medicine:", error);
                        toast.error("Failed to save medicine");
                      } finally {
                        setIsSaving(false);
                      }
                    } else {
                      handleNextStep();
                    }
                  }}
                >
                  {currentStep === 1 || currentStep === 2 ? "NEXT" : "SAVE"}
                  {currentStep === 1 || currentStep === 2 ? (
                    <svg
                      className="arrow ms-3"
                      xmlns="http://www.w3.org/2000/svg"
                      width="26"
                      height="26"
                      viewBox="0 0 26 26"
                    >
                      <path
                        fill="currentColor"
                        d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
                      />
                    </svg>
                  ) : (
                    " "
                  )}
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </>
  );
};

export default MedecineAdd;

<style jsx>{`
  .time-picker::-webkit-calendar-picker-indicator {
    cursor: pointer;
  }
`}</style>
