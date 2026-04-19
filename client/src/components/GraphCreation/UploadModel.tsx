import { File } from "lucide-react";
import React, { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<Props> = ({ open, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (!open) return null;

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("http://localhost:8000/api/upload-dataset", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setStatus(`${data.message}`);
      setTimeout(onClose, 1200);
    } catch (err) {
      console.error(err);
      setStatus("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-[480px] bg-[#020811] border border-cyan-400/20 rounded-xl p-6 shadow-[0_0_60px_rgba(0,255,200,0.08)]">

        {/* HEADER */}
        <div className="mb-5">
          <h2 className="text-cyan-400 font-mono text-sm tracking-widest">
            DATA INGESTION
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Upload a CSV file to populate the Paper ↔ Patent graph
          </p>
        </div>

        {/* FILE DROP ZONE */}
        <div
          className="border border-dashed border-cyan-400/30 rounded-lg p-6 text-center cursor-pointer hover:bg-cyan-400/5 transition"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = e.dataTransfer.files[0];
            if (dropped) setFile(dropped);
          }}
        >
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="fileUpload"
          />

          <label htmlFor="fileUpload" className="cursor-pointer block">
            <div className="text-2xl mb-2 opacity-60 items-center">
                <File />
            </div>

            <p className="text-sm text-gray-300">
              {file ? file.name : "Click or drag CSV file here"}
            </p>

            <p className="text-[10px] text-gray-500 mt-1">
              Only .csv supported
            </p>
          </label>
        </div>

        {/* FORMAT INFO */}
        <div className="mt-5 p-3 rounded-md bg-white/5 border border-white/10">
          <p className="text-[10px] text-gray-400 font-mono mb-2">
            REQUIRED FORMAT
          </p>
          <div className="text-[10px] text-gray-500 font-mono leading-relaxed">
            paper_id, paper_title, patent_id, patent_title, similarity
            <br />
            P1, AI Research, PT1, Smart Device, 0.87
          </div>
        </div>

        {/* STATUS */}
        {status && (
          <div className={`mt-4 text-xs font-mono text-center ${status === "Upload failed" ? "text-red-400" : "text-green-400"}`}>
            {status}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono border border-white/20 rounded-md text-gray-400 hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`px-5 py-2 text-xs font-mono rounded-md border transition-all
              ${
                !file
                  ? "border-gray-600 text-gray-500 cursor-not-allowed"
                  : "bg-cyan-400/10 border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20"
              }
            `}
          >
            {loading ? "Uploading..." : "Upload Dataset"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;