import React, { useState, useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const ReportVerification = ({ reportId, currentStatus, onStatusUpdate}) => {
  const [status, setStatus] = useState(currentStatus || 'under review');
  const [verificationNote, setVerificationNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { url, token } = useContext(AppContext);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.patch(
        `${url}/api/report/${reportId}/verify`,
        {
          status,
          verification_note: verificationNote
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success("Report status updated successfully", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true
        });
        onStatusUpdate(status, verificationNote);
        setVerificationNote('');
      } else {
        toast.error("Failed to update report status", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true
        });
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Error updating report status", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 my-4">
      <h3 className="text-lg font-semibold mb-2">Researcher Verification</h3>
      
      <div className="flex flex-col space-y-4">
        <div className="flex space-x-2">
          <Button 
            variant={status === 'approved' ? "default" : "outline"}
            className={`flex items-center gap-2 ${status === 'approved' ? "bg-green-600 hover:bg-green-700" : ""}`}
            onClick={() => setStatus('approved')}
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </Button>
          
          <Button 
            variant={status === 'rejected' ? "default" : "outline"}
            className={`flex items-center gap-2 ${status === 'rejected' ? "bg-red-600 hover:bg-red-700" : ""}`}
            onClick={() => setStatus('rejected')}
          >
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
        </div>
        
        <div>
          <label htmlFor="verification-note" className="block text-sm font-medium mb-1">
            Verification Note
          </label>
          <Textarea
            id="verification-note"
            placeholder="Add any notes or feedback about this report..."
            value={verificationNote}
            onChange={(e) => setVerificationNote(e.target.value)}
            className="w-full resize-none"
            rows={3}
          />
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || status === currentStatus}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : "Submit Verification"}
        </Button>
      </div>
    </div>
  );
};

export default ReportVerification;