import { FC, useState, useEffect } from "react";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PrescriptionService,
  Symptom,
} from "../../../services/PrescriptionService";
interface PrescriptionAddProps {
  patientId: string | string[] | undefined;
}

const PrescriptionAdd: FC<PrescriptionAddProps> = ({ patientId }) => {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedsymptoms, setSelectedsymptoms] = useState<Symptom[]>([]);
  const [showsymptomsList, setShowsymptomsList] = useState(false);
  const [newsymptoms, setNewsymptoms] = useState("");
  
  const [isLoadingsymptoms, setIsLoadingsymptoms] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Load initial selected symptoms from localStorage
  useEffect(() => {
    const tempSelectedSymptoms = localStorage.getItem("tempSelectedSymptoms");
    if (tempSelectedSymptoms) {
      try {
        const parsedSymptoms = JSON.parse(tempSelectedSymptoms);
        setSelectedsymptoms(parsedSymptoms);
        // Clear the temporary storage after loading
        localStorage.removeItem("tempSelectedSymptoms");
      } catch (error) {
        console.error("Error parsing temp selected symptoms:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchsymptoms = async () => {
      try {
        const response = await PrescriptionService.getSymptoms();
        console.log(response);
        if (response.status === "success") {
          setSymptoms(response.data.symptoms);
        }
      } catch (error) {
        console.error("Error fetching test names:", error);
        toast.error("Failed to fetch test names");
      } finally {
        setIsLoadingsymptoms(false);
      }
    };

    fetchsymptoms();
  }, []);
    
 // Filter test names based on search
 const filteredsymptoms = symptoms.filter((test) =>
  test.description.toLowerCase().includes(searchTerm.toLowerCase())
);
  const handleSymptomSelect = (symptoms: Symptom) => {
    if (!selectedsymptoms.find((t) => t.id === symptoms.id)) {
      setSelectedsymptoms([...selectedsymptoms, symptoms]);
    }
    setShowsymptomsList(false);
    setNewsymptoms("");
  };

  const removesymptoms = (symptomsId: number) => {
    setSelectedsymptoms(selectedsymptoms.filter((t) => t.id !== symptomsId));
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleAddNewsymptoms = async () => {
    if (!searchTerm.trim()) return;
  
    try {
      const response = await PrescriptionService.createSymptom(searchTerm.trim());
      if (response.status === "success" && response.data) {
        setSymptoms((prev) => [...prev, response.data]);
        handleSymptomSelect(response.data);
        toast.success("New Tag added successfully");
        setSearchTerm(""); // Clear search input after adding
      }
    } catch (error) {
      console.error("Error adding new tag:", error);
      toast.error("Failed to add new tag");
    }
  };
  const handleDone = () => {
    // Navigate back to add.tsx with selected test names
    router.push({
      pathname: `/view-patient/${patientId}`,
      query: {
        view: "add",
        tab: "prescription",
        selectedsymptoms: JSON.stringify(selectedsymptoms)
      }
    });
  };
 
  return (
    <>
    <ToastContainer />
      <div className="patient-view-content-header">
        <h5 className="card-title">
          <span className="icon lab-report"></span> Add Prescription
        </h5>
        <Link
        href={`/view-patient/${patientId}?view=add&tab=prescription`}
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
              onClick={handleAddNewsymptoms}
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
              onClick={handleAddNewsymptoms}
              style={{ cursor: "pointer" }}
            >
              + Add as new
            </a>
          </div>
          <div className="list-area">
            <ul className="lists">
            {filteredsymptoms.map((test) => {
                const isSelected = selectedsymptoms.some((t) => t.id === test.id);
                return (
                  <li className="item" key={test.id}>
                    <span>{test.description}</span>
                    {!isSelected ? (
                      <a href="#" className="add" onClick={() => handleSymptomSelect(test)}>
                        Add
                      </a>
                    ) : (
                      <a href="#" className="cancel" onClick={() => removesymptoms(test.id)}>
                        Cancel
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="d-flex justify-content-center">
            <button 
              className="btn btn-primary mx-2"
              onClick={handleDone}
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrescriptionAdd;
