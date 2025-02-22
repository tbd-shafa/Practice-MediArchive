//service-start
 static async saveMedicineReminder(data: any): Promise<ApiResponse> {
    const formData = new URLSearchParams();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key].toString());
      }
    });
  
    return await api.put<ApiResponse>(
      `${config.API_ENDPOINTS.MEDICINE_LIST}/${data.medicine_id}/`,
      formData,
      {
        requiresAuth: true,
      }
    );
  }
//service-end
//id start
const MedicineReminder = dynamic(() => import("./medicine/reminder"), {
  ssr: false,
});
 if (view === "reminder" && activeTab === "medicine") {
      const { medicineid } = router.query;
      return <MedicineReminder patientId={id} medicineId={medicineid as string} />;
    }
//id end


import { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MedicineService } from "../../../services/MedicineService";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
interface MedicineReminderProps {
  patientId: string | string[] | undefined;
  medicineId: string;
}
interface FormData {
  reminder_start_date: string | null;
  reminder_end_date: string | null;
  reminder_times: string[];
  continue: boolean;
}

const MedicineReminder: FC<MedicineReminderProps> = ({ patientId, medicineId }) => {
  const router = useRouter();
  const [medicine, setMedicine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const initialFormData: FormData = {
    reminder_start_date: null,
    reminder_end_date: null,
    reminder_times: [],
    continue: false
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
          let reminderTimes: string[] = [];
          if (response.data.reminder_times) {
            // Ensure each time is properly formatted with HH:mm
            reminderTimes = response.data.reminder_times.split(',').map((time: string) => {
              const trimmedTime = time.trim();
              // If time doesn't include seconds, it's already in correct format
              if (trimmedTime.length === 5) return trimmedTime;
              // If time includes seconds, remove them
              if (trimmedTime.length === 8) return trimmedTime.substring(0, 5);
              return trimmedTime;
            });
          }
          
        setFormData({
          reminder_start_date: response.data.reminder_start_date || response.data.start_date,
          reminder_end_date: response.data.reminder_end_date || response.data.end_date,
          reminder_times: reminderTimes,
          // Only set continue to true if there's no end date and no reminder end date
          continue: !response.data.reminder_end_date && !response.data.end_date
        });
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

   // Use the initial state in useState
  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const reminderSubmitData = () => {
    if (formData.reminder_times.length === 0) {
      toast.error("Please add at least one reminder time");
      return null;
    }
     // Check for any empty or null times
  const hasEmptyTimes = formData.reminder_times.some(time => !time || time.trim() === '');
  if (hasEmptyTimes) {
    toast.error("Please select time for all reminder inputs or remove empty ones");
    return null;
  }

    return {
      medicine_id: typeof medicineId === "string" ? medicineId :
                  Array.isArray(medicineId) ? medicineId[0] : "",
      reminder_start_date: formData.reminder_start_date,
      reminder_end_date: formData.continue ? null : formData.reminder_end_date,
      reminder_times: formData.reminder_times.join(","),
    };
  };

  const scrollStyles = {
    pageWrapper: {
      height: "calc(100vh - 60px)", // Adjust based on your header height
      display: "flex",
      flexDirection: "column" as const,
    },
    contentScroll: {
      flex: 1,
      overflowY: "auto" as const,
      padding: "20px",
    },
    stickyHeader: {
      position: "sticky" as const,
      top: 0,
      backgroundColor: "#fff",
      zIndex: 10,
      padding: "15px",
      borderBottom: "1px solid #e0e0e0",
    },
    stickyFooter: {
      position: "sticky" as const,
      bottom: 0,
      backgroundColor: "#fff",
      padding: "15px",
      borderTop: "1px solid #e0e0e0",
      zIndex: 10,
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
         <div className="d-flex flex-column h-100" style={{ height: 'calc(100vh - 60px)' }}>
          <ToastContainer />
          
          <div className="patient-view-content-header">
            <h5 className="card-title">
              <span className="icon notes"></span> Medicine Reminder
            </h5>
           
           
            <Link
              href={`/view-patient/${patientId}?tab=medicine&view=view&medicineid=${medicineId}`}
              className="btn-patient-sm-add"
            >
              Back
            </Link>
          </div>
          <div className="note-details">
            <div className="medicine-view">
            <img
                      src="/images/placeholder.svg"
                      alt="Placeholder"
                      id="patient-photo"
                    />
              <h2>{medicine.medicine_type.type} {medicine.name}</h2>
            </div>
          </div>
          <form>
            <div className="add-patient-from-card">
              <div className="row">
                    <div className="col-md-12 mb-3">
                      <div className="form-group">
                        <label>Reminder Start Date</label>
                        <input
                  type="date"
                  className="form-control"
                  value={formData.reminder_start_date || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    reminder_start_date: e.target.value
                  })}
                />
                      </div>
                    </div>

                    <div className="col-md-12 mb-3">
                      <div className="form-group">
                        <label>Reminder End Date</label>
                        <div className="d-flex align-items-center">
                        <input
                          type="date"
                          className="form-control"
                          value={formData.reminder_end_date || ''}
                          disabled={formData.continue}
                          onChange={(e) => setFormData({
                            ...formData,
                            reminder_end_date: e.target.value
                          })}
                        />
                      </div>
                      {!formData.reminder_end_date && (
                        <div className="form-check mt-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={formData.continue}
                            onChange={(e) => setFormData({
                              ...formData,
                              continue: e.target.checked,
                              reminder_end_date: e.target.checked ? null : formData.reminder_end_date
                            })}
                          />
                          <label className="form-check-label">Continue</label>
                        </div>
                      )}
                      </div>
                    </div>

                 
                     {/* Reminder times section */}
                <div className="col-md-12 mb-3">
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
                            value={time || ''} // Handle empty values
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
                              const newTimes = formData.reminder_times.filter((_, i) => i !== index);
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
                            reminder_times: [...formData.reminder_times, ""],
                          });
                        }}
                      >
                        + Add another time
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                className="btn btn-primary w-242px"
                onClick={async () => {
                 
                    // Save data without going to step 4
                    try {
                      setIsSaving(true);
                      const submitData = reminderSubmitData(); // Call the function to create submit data

                      const response = await MedicineService.saveMedicineReminder(
                        submitData
                      );

                      if (response.status === "success") {
                        toast.success('Reminder  saved successfully');
                        setTimeout(() => {
                          router.push(`/view-patient/${patientId}?tab=medicine&view=view&medicineid=${medicineId}`);
                        }, 1000);
                      }
                    } catch (error) {
                      console.error("Error saving medicine:", error);
                     // toast.error("Failed to save reminder");
                    } finally {
                      setIsSaving(false);
                    }
                  
                }}
              >
                Save
              </button>
            </div>
          </form>
          </div>
         
        </>
      )}
    </>
  );
};

export default MedicineReminder;
