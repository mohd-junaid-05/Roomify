import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import React, { useState } from "react";
import { useOutletContext } from "react-router";
import {
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
} from "../../lib/constants";

interface UploadProps {
  onComplete: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const { isSignIn } = useOutletContext<AuthContext>();

  // ── processFile ──────────────────────────────────────────────────────────────
  const processFile = (selected: File) => {
    if (!isSignIn) return;

    setFile(selected);
    setProgress(0);

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      // Animate progress from 0 → 100
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + PROGRESS_STEP;

          if (next >= 100) {
            clearInterval(interval);
            // Small delay before handing off so the 100 % state is visible
            setTimeout(() => onComplete(base64), REDIRECT_DELAY_MS);
            return 100;
          }

          return next;
        });
      }, PROGRESS_INTERVAL_MS);
    };

    reader.readAsDataURL(selected);
  };

  // ── onChange (file input) ────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignIn) return;
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  // ── Drag-and-drop handlers ───────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isSignIn) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isSignIn) return;

    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg, .jpeg, .png"
            disabled={!isSignIn}
            onChange={handleChange}
          />
          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p className="drop-text">
              {isSignIn
                ? "Click to upload or just drag and drop"
                : "Sign in or sign up with Puter to upload"}
            </p>
            <p className="help">Maximum file size 50 MB.</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>
            <h3>{file.name}</h3>
            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
              <p className="status-text">
                {progress < 100 ? "Analyzing Floor Plan..." : "Done!"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
