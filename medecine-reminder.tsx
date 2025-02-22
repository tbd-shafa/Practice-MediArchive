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
<Link href="/UserProfile">
  <div style={{ position: 'relative', width: '160px', height: '216px' }}>
    {/* Loading Placeholder */}
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

    {patient?.profile_picture ? (
      <img
        src={patient.profile_picture}
        alt={patient.name}
        width={160}
        height={216}
        style={{
          objectFit: 'cover',
          borderRadius: '8px',
          position: 'relative',
          zIndex: 1
        }}
        onLoad={(e) => {
          // Hide loader when image loads
          const target = e.target as HTMLImageElement;
          //target.style.zIndex = 2;
        }}
      />
    ) : (
      <Image
        src="/images/placeholder-patient.svg"
        alt="User"
        width={80}
        height={80}
        style={{
          objectFit: 'contain',
          borderRadius: '8px',
          position: 'relative',
          zIndex: 2
        }}
      />
    )}

    <div className="patient-view-sidebar-header-avatar-icon" style={{ zIndex: 3 }}>
      <svg
        id="Group_3366"
        data-name="Group 3366"
        xmlns="http://www.w3.org/2000/svg"
        width="29"
        height="23.586"
        viewBox="0 0 29 23.586"
      >
        <defs>
          <clipPath id="clip-path">
            <rect
              id="Rectangle_952"
              data-name="Rectangle 952"
              width="29"
              height="23.586"
              fill="#1a72e8"
            />
          </clipPath>
        </defs>
        <g
          id="Group_3365"
          data-name="Group 3365"
          clip-path="url(#clip-path)"
        >
          <path
            id="Path_4576"
            data-name="Path 4576"
            d="M63.581,11.152a.906.906,0,0,0-1.282,0l-1.172,1.172v-.53A11.8,11.8,0,0,0,49.359,0h-.013a11.733,11.733,0,0,0-9.9,5.4.906.906,0,0,0,1.524.982,9.927,9.927,0,0,1,8.38-4.57h.011a9.98,9.98,0,0,1,9.958,9.981v.531l-1.172-1.172a.906.906,0,1,0-1.282,1.282l2.719,2.719.019.017c.015.014.031.029.047.042l.037.028.034.025.042.026.034.02.043.021.038.017.042.015.042.015L60,15.39l.044.011.048.007.04.006c.03,0,.06,0,.089,0s.06,0,.089,0l.04-.006L60.4,15.4l.044-.011.042-.011.042-.015.042-.015.038-.017.043-.021.034-.02.042-.026.034-.025.037-.028c.016-.013.032-.028.047-.042l.019-.017,2.719-2.719a.906.906,0,0,0,0-1.282"
            transform="translate(-34.847)"
            fill="#1a72e8"
          />
          <path
            id="Path_4577"
            data-name="Path 4577"
            d="M24.133,59.589a.906.906,0,0,0-1.253.271,10.087,10.087,0,0,1-.924,1.219,9,9,0,0,0-3.354-2.93c-.245-.124-.493-.234-.744-.335a5.438,5.438,0,1,0-6.713,0,9.029,9.029,0,0,0-4.1,3.261,9.9,9.9,0,0,1-2.515-6.629v-.531L5.7,55.09a.906.906,0,0,0,1.282-1.282L4.266,51.09a.9.9,0,0,0-.067-.061l-.029-.022-.042-.031-.037-.023-.039-.023-.039-.019-.041-.019-.038-.014-.045-.016-.039-.01L3.8,50.841l-.044-.007-.043-.006c-.026,0-.053,0-.079,0h-.02c-.026,0-.053,0-.079,0l-.043.006-.044.007-.047.012-.039.01-.045.016-.039.014-.041.019-.039.019-.039.023-.037.023-.042.031-.029.022c-.023.019-.046.039-.067.061L.265,53.808A.906.906,0,0,0,1.547,55.09l1.172-1.172v.53A11.781,11.781,0,0,0,14.487,66.242H14.5a11.733,11.733,0,0,0,9.9-5.4.906.906,0,0,0-.271-1.253M14.5,49.917a3.625,3.625,0,1,1-3.625,3.625A3.629,3.629,0,0,1,14.5,49.917m0,14.512h-.011a9.892,9.892,0,0,1-6.1-2.1,7.248,7.248,0,0,1,12.23,0A9.931,9.931,0,0,1,14.5,64.429"
            transform="translate(0 -42.656)"
            fill="#1a72e8"
          />
        </g>
      </svg>
    </div>
  </div>
</Link>
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
  //reminder_start_date: string | null;
  //reminder_end_date: string | null;
  reminder_times: string[];
  //continue: boolean;
}

const MedicineReminder: FC<MedicineReminderProps> = ({ patientId, medicineId }) => {
  const router = useRouter();
  const [medicine, setMedicine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const initialFormData: FormData = {
   // reminder_start_date: null,
   // reminder_end_date: null,
    reminder_times: [],
   // continue: false
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
          //reminder_start_date: response.data.reminder_start_date || response.data.start_date,
         // reminder_end_date: response.data.reminder_end_date || response.data.end_date,
          reminder_times: reminderTimes,
          // Only set continue to true if there's no end date and no reminder end date
         // continue: !response.data.reminder_end_date && !response.data.end_date
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
     // reminder_start_date: formData.reminder_start_date,
     // reminder_end_date: formData.continue ? null : formData.reminder_end_date,
      reminder_times: formData.reminder_times.join(","),
    };
  };

 
  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString === 'null') return null;
  
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };
  const scrollableContainerStyle = {
    maxHeight: "calc(100vh - 200px)", // Adjust this value based on your header height
    overflowY: "auto",
    padding: "20px",
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
         <div
            className="timeline"
            style={{
              maxHeight: scrollableContainerStyle.maxHeight,
              overflowY: scrollableContainerStyle.overflowY as
                | "auto"
                | "scroll"
                | "hidden"
                | "visible",
              padding: scrollableContainerStyle.padding,
            }}
          >
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
                        <p>
  {medicine.reminder_start_date === 'null' ? 
    formatDate(medicine.start_date) : 
    formatDate(medicine.reminder_start_date)}
</p>

                        {/* <input
                  type="date"
                  className="form-control"
                  value={formData.reminder_start_date || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    reminder_start_date: e.target.value
                  })}
                /> */}
                      </div>
                    </div>

                    <div className="col-md-12 mb-3">
                      <div className="form-group">
                        <label>Reminder End Date</label>
                        <p>
  {(!medicine.reminder_end_date || medicine.reminder_end_date === 'null') && 
   (!medicine.end_date || medicine.end_date === 'null')
    ? 'Continue'
    : formatDate(medicine.reminder_end_date !== 'null' ? medicine.reminder_end_date : medicine.end_date)}
</p>


                        <div className="d-flex align-items-center">
                        {/* <input
                          type="date"
                          className="form-control"
                          value={formData.reminder_end_date || ''}
                          disabled={formData.continue}
                          onChange={(e) => setFormData({
                            ...formData,
                            reminder_end_date: e.target.value
                          })}
                        /> */}
                      </div>
                      {/* {!formData.reminder_end_date && (
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
                      )} */}
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
