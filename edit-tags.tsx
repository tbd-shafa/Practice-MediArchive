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
