

import { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import "react-toastify/dist/ReactToastify.css";

import ImageAttachment from "../../../components/ImageAttachment";

interface PrescriptionEditProps {
  patientId: string | string[] | undefined;
  prescriptionId: string; // Add prescriptionId to the props interface
}

const PrescriptionEditAttachment: FC<PrescriptionEditProps> = ({ patientId, prescriptionId }) => {
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
      const existingImages = JSON.parse(localStorage.getItem("PrescriptionImages") || "[]");
  
      // Merge new images with existing ones, avoiding duplicates
      const updatedImages = [...existingImages, ...imageUrls];
  
      // Save back to localStorage
      localStorage.setItem("PrescriptionImages", JSON.stringify(updatedImages));
  
      router.push({
        pathname: `/view-patient/${patientId}`,
        query: {
          view: "edit",
          tab: "prescription",
          prescriptionId,

        },
      });
    });
  };
  

  return (
    <>
      <div className="patient-view-content-header">
        <h5 className="card-title">
          <span className="icon lab-report"></span> Edit Prescription
        </h5>
        
        <Link
          href={`/view-patient/${patientId}?view=edit&tab=prescription&prescriptionId=${prescriptionId}`}
          className="btn-patient-sm-add close-btn"
        >
          Close
        </Link>
      </div>
      
      <ImageAttachment onContinue={handleContinue} />
    </>
  );
};

export default PrescriptionEditAttachment;
