import { FC, useState, useEffect } from "react";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import {
  PrescriptionService,
  Test_name,
} from "../../../services/PrescriptionService";
import { LabReportService } from "../../../services/LabReportService";
interface LabReportEditTagsProps {
  patientId: string | string[] | undefined;
  labReportId: string | string[] | undefined;
}

const LabReportEditTags: FC<LabReportEditTagsProps> = ({ patientId, labReportId }) => {
  const router = useRouter();
  const [test_names, setTest_names] = useState<Test_name[]>([]);
  const [selectedTest_names, setSelectedTest_names] = useState<Test_name[]>([]);
  const [isLoadingTest_names, setIsLoadingTest_names] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all available Test_names and load selected ones
  useEffect(() => {
    const fetchTest_names = async () => {
      try {
        const response = await PrescriptionService.getTestnames();
        if (response.status === "success") {
          setTest_names(response.data.test_names);
          
          // After fetching all test_names, load the selected ones from localStorage
          const storedTest_names = localStorage.getItem("selectedTest_names");
          if (storedTest_names) {
            try {
              const parsedTest_names = JSON.parse(storedTest_names);
              setSelectedTest_names(parsedTest_names);
            } catch (error) {
              console.error("Error parsing stored Test_names:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching Test_names:", error);
        toast.error("Failed to fetch Test_names");
      } finally {
        setIsLoadingTest_names(false);
      }
    };

    fetchTest_names();
  }, []);

  // Filter Test_names based on search
  const filteredTest_names = test_names.filter((test_name) =>
    test_name.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTest_nameselect = (test_name: Test_name) => {
    if (!selectedTest_names.find((t) => t.id === test_name.id)) {
      const updatedTest_names = [...selectedTest_names, test_name];
      setSelectedTest_names(updatedTest_names);
      localStorage.setItem("selectedTest_names", JSON.stringify(updatedTest_names));
    }
  };

  const removeTest_name = (test_nameId: number) => {
    const updatedTest_names = selectedTest_names.filter((t) => t.id !== test_nameId);
    setSelectedTest_names(updatedTest_names);
    localStorage.setItem("selectedTest_names", JSON.stringify(updatedTest_names));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleAddNewTest_name = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await LabReportService.createTestName(searchTerm.trim());
      if (response.status === "success" && response.data) {
        setTest_names((prev) => [...prev, response.data]);
        handleTest_nameselect(response.data);
        toast.success("Test_name added successfully");
        setSearchTerm("");
      }
    } catch (error) {
      console.error("Error adding new Test_name:", error);
      toast.error("Failed to add new Test_name");
    }
  };

  const handleDone = () => {
    // First update localStorage
    localStorage.setItem("selectedTest_names", JSON.stringify(selectedTest_names));
    
    // Get current state from URL
    const currentDate = router.query.currentDate as string;
    const currentDoctors = router.query.currentDoctors as string;
    
    // Then navigate back with the selected Test_names and current state
    router.push({
      pathname: `/view-patient/${patientId}`,
      query: {
        view: "edit",
        tab: "lab-report",
        labReportId,
        selectedtest_names: JSON.stringify(selectedTest_names),
        currentDate,
        currentDoctors
      },
    });
  };

  return (
    <>
      <ToastContainer />
      <div className="patient-view-content-header">
        <h5 className="card-title">
          <span className="icon lab-report"></span> Edit LabReport Tags
        </h5>
        <Link
          href={`/view-patient/${patientId}?view=edit&tab=lab-report&labReportId=${labReportId}`}
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
              onClick={handleAddNewTest_name}
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
              onClick={handleAddNewTest_name}
              style={{ cursor: "pointer" }}
            >
              + Add as new
            </a>
          </div>
          <div className="list-area">
            <ul className="lists">
              {filteredTest_names.map((test_name) => {
                const isSelected = selectedTest_names.some((t) => t.id === test_name.id);
                return (
                  <li className="item" key={test_name.id}>
                    <span>{test_name.description}</span>
                    {!isSelected ? (
                      <a href="#" className="add" onClick={() => handleTest_nameselect(test_name)}>
                        Add
                      </a>
                    ) : (
                      <a href="#" className="cancel" onClick={() => removeTest_name(test_name.id)}>
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

export default LabReportEditTags;
