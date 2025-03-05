import { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import "react-toastify/dist/ReactToastify.css";

import ImageAttachment from "../../../components/ImageAttachment";

interface LabReportEditProps {
  patientId: string | string[] | undefined;
  labReportId: string; // Add labReportId to the props interface
}

const LabReportEditAttachment: FC<LabReportEditProps> = ({ patientId, labReportId }) => {
  const router = useRouter();
  const handleContinue = (files: File[]) => {
    const imagePromises = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
  
    Promise.all(imagePromises).then((imageUrls) => {
      // Retrieve existing images from localStorage
      const existingImages = JSON.parse(localStorage.getItem("LabReportImages") || "[]");
  
      // Merge new images with existing ones, avoiding duplicates
      const updatedImages = [...existingImages, ...imageUrls];
  
      // Save back to localStorage
      localStorage.setItem("LabReportImages", JSON.stringify(updatedImages));

      // Get current state from URL
      const currentDate = router.query.currentDate as string;
      const currentDoctors = router.query.currentDoctors as string;
  
      router.push({
        pathname: `/view-patient/${patientId}`,
        query: {
          view: "edit",
          tab: "lab-report",
          labReportId,
          currentDate,
          currentDoctors
        },
      });
    });
  };
  

  return (
    <>
      <div className="patient-view-content-header">
        <h5 className="card-title">
          <span className="icon lab-report"></span> Edit LabReports
        </h5>
        <Link
          href={`/view-patient/${patientId}?view=edit&tab=lab-report&labReportId=${labReportId}`}
          className="btn-patient-sm-add close-btn"
        >
          Close
        </Link>
      </div>
      
      <ImageAttachment onContinue={handleContinue} />
    </>
  );
};

export default LabReportEditAttachment;
