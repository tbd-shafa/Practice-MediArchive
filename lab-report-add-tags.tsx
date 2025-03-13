import { FC, useState, useEffect } from "react";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useRouter } from "next/router";
import ImageAttachment from "../../../components/ImageAttachment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { LabReportService, TestName } from "../../../services/LabReportService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
interface LabReportAddProps {
  patientId: string | string[] | undefined;
}

const LabReportAdd: FC<LabReportAddProps> = ({ patientId }) => {
  const router = useRouter();
 const [testNames, setTestNames] = useState<TestName[]>([]);
  const [selectedTestNames, setSelectedTestNames] = useState<TestName[]>([]);
  const [showTestNamesList, setShowTestNamesList] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTestNames, setIsLoadingTestNames] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Load initial selected test names from localStorage
  useEffect(() => {
    const tempSelectedTestNames = localStorage.getItem("tempSelectedTestNames");
    if (tempSelectedTestNames) {
      try {
        const parsedTestNames = JSON.parse(tempSelectedTestNames);
        setSelectedTestNames(parsedTestNames);
        // Clear the temporary storage after loading
        localStorage.removeItem("tempSelectedTestNames");
      } catch (error) {
        console.error("Error parsing temp selected test names:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchTestNames = async () => {
      try {
        const response = await LabReportService.getTestNames();
        console.log(response);
        if (response.status === "success") {
          setTestNames(response.data.test_names);
        }
      } catch (error) {
        console.error("Error fetching test names:", error);
        toast.error("Failed to fetch test names");
      } finally {
        setIsLoadingTestNames(false);
      }
    };

    fetchTestNames();
  }, []);

 // Filter test names based on search
 const filteredTestNames = testNames.filter((test) =>
  test.description.toLowerCase().includes(searchTerm.toLowerCase())
);
  const handleTestNameSelect = (testName: TestName) => {
    if (!selectedTestNames.find((t) => t.id === testName.id)) {
      setSelectedTestNames([...selectedTestNames, testName]);
    }
    setShowTestNamesList(false);
    setNewTestName("");
  };

  const removeTestName = (testNameId: number) => {
    setSelectedTestNames(selectedTestNames.filter((t) => t.id !== testNameId));
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleAddNewTestName = async () => {
    if (!searchTerm.trim()) return;
  
    try {
      const response = await LabReportService.createTestName(searchTerm.trim());
      if (response.status === "success" && response.data) {
        setTestNames((prev) => [...prev, response.data]);
        handleTestNameSelect(response.data);
        toast.success("New Tag added successfully");
        setSearchTerm(""); // Clear search input after adding
      }
    } catch (error) {
      console.error("Error adding new tag:", error);
      toast.error("Failed to add new tag");
    }
  };
  const handleDone = () => {
    // Store selected test names in localStorage
    localStorage.setItem("selectedTestNames", JSON.stringify(selectedTestNames));
    
    // Navigate back to add.tsx
    router.push({
      pathname: `/view-patient/${patientId}`,
      query: {
        view: "add",
        tab: "lab-report"
      }
    });
  };
  return (
    <>
    <ToastContainer />
      <div className="patient-view-content-header">
        <h5 className="card-title">
          <span className="icon lab-report"></span> Add Lab Report
        </h5>
        <Link
        href={`/view-patient/${patientId}?view=add&tab=lab-report`}
          className="btn-patient-sm-add close-btn"
        >
          Close
        </Link>
      </div>
      
      <div className="lab-rpt-tags-full-area">
        <div className="top-header">
          <p>Search tags to Add for this LabReport</p>
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
              onClick={handleAddNewTestName}
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
              onClick={handleAddNewTestName}
              style={{ cursor: "pointer" }}
            >
              + Add as new
            </a>
          </div>
          <div className="list-area">
            <ul className="lists">
            {filteredTestNames.map((test) => {
                const isSelected = selectedTestNames.some((t) => t.id === test.id);
                return (
                  <li className="item" key={test.id}>
                    <span>{test.description}</span>
                    {!isSelected ? (
                      <a href="#" className="add" onClick={() => handleTestNameSelect(test)}>
                        Add
                      </a>
                    ) : (
                      <a href="#" className="cancel" onClick={() => removeTestName(test.id)}>
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

export default LabReportAdd;
