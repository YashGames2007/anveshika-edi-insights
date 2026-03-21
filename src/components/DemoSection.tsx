import { useState, useRef, useEffect } from "react";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  Wrench,
  X
} from "lucide-react";

interface DemoSectionProps {
  initialEdi?: string;
  initialErrors?: any[];
  initialSegments?: any[];
  initialMetadata?: any[];
}

export default function DemoSection({
  initialEdi = "",
  initialErrors = [],
  initialSegments = [],
  initialMetadata = [],
}: DemoSectionProps) {

  const [segments, setSegments] = useState<any[]>(initialSegments);
  const [errors, setErrors] = useState<any[]>(initialErrors);
  const [metadata, setMetadata] = useState<any[]>(initialMetadata);
  const [rawEDI, setRawEDI] = useState<string[]>(
    initialEdi
      ? initialEdi.replace(/\n/g, "").split("~").filter(l => l.trim() !== "")
      : []
  );
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("segments");

  const [showFixPopup, setShowFixPopup] = useState(false);
  const [selectedError, setSelectedError] = useState<any | null>(null);
  const [currentEdi, setCurrentEdi] = useState<string>(initialEdi);
  const [fixData, setFixData] = useState<{ fixed_edi: string; before_line: string; after_line: string; } | null>(null);
  const [manualEditMode, setManualEditMode] = useState(false);
  const [manualAfterText, setManualAfterText] = useState<string>("");
  const [fixErrorMessage, setFixErrorMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const parseEdi = async (ediText: string) => {
    setCurrentEdi(ediText);

    const lines = ediText
      .replace(/\n/g, "")
      .split("~")
      .filter(l => l.trim() !== "");

    setRawEDI(lines);

    setLoading(true);

    const formData = new FormData();
    formData.append("file", new Blob([ediText], { type: "text/plain" }), "edi.edi");

    try {
      const res = await fetch("https://edi-parser-jfng.onrender.com/parse-edi", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setSegments(data.segments || []);
      setErrors(data.errors || []);

      setMetadata(
        Array.isArray(data.metadata)
          ? data.metadata
          : data.metadata
          ? [data.metadata]
          : []
      );
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleFileUpload = async (file: File) => {
    const text = await file.text();
    await parseEdi(text);
  };

  const handleDrop = (e: React.DragEvent) => {

    e.preventDefault();

    const files = e.dataTransfer.files;

    if (files.length > 0) {
      handleFileUpload(files[0]);
    }

  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const selectedLine =
    selectedRow ? rawEDI[selectedRow - 1] : null;

  const selectedSegment =
    segments.find(s => s.row === selectedRow);

  const handleFixButton = async (err: any) => {
    setSelectedError(err);
    setFixErrorMessage("");
    setManualEditMode(false);
    setFixData(null);
    setShowFixPopup(true);

    if (!currentEdi) {
      setFixErrorMessage("No EDI content loaded.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", new Blob([currentEdi], { type: "text/plain" }), "edi.edi");
      formData.append("code", err.code);
      formData.append("row", String(err.row));
      if (err.column != null) formData.append("column", String(err.column));
      if (err.segment_id) formData.append("segment_id", String(err.segment_id));

      const res = await fetch("https://edi-parser-jfng.onrender.com/fix-error", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Unable to fix error (${res.status})`);
      }

      const data = await res.json();

      if (!data.fixed_edi) {
        setFixErrorMessage("Unable to auto-fix; choose manual");
        setFixData({
          fixed_edi: currentEdi,
          before_line: rawEDI[err.row - 1] || "",
          after_line: rawEDI[err.row - 1] || "",
        });
        setManualAfterText(rawEDI[err.row - 1] || "");
        return;
      }

      setFixData({
        fixed_edi: data.fixed_edi,
        before_line: data.before_line ?? rawEDI[err.row - 1] ?? "",
        after_line: data.after_line ?? rawEDI[err.row - 1] ?? "",
      });

      setManualAfterText(data.after_line ?? rawEDI[err.row - 1] ?? "");
    } catch (error: any) {
      setFixErrorMessage(error?.message || "Fix service failed.");
    }
  };

  const beforeCorrection =
    fixData?.before_line ?? (selectedError ? rawEDI[selectedError.row - 1] : "");

  const afterCorrection =
    fixData?.after_line ?? beforeCorrection;

  const applyEdiFromFix = async (nextEdi: string) => {
    setShowFixPopup(false);
    setManualEditMode(false);
    setFixErrorMessage("");
    setFixData(null);
    await parseEdi(nextEdi);
  };

  const handleAcceptFix = async () => {
    if (!fixData?.fixed_edi) {
      setFixErrorMessage("No fixed EDI to accept.");
      return;
    }
    await applyEdiFromFix(fixData.fixed_edi);
  };

  const handleDeclineFix = () => {
    setShowFixPopup(false);
    setManualEditMode(false);
    setFixData(null);
    setFixErrorMessage("");
  };

  const handleStartManualEdit = () => {
    setManualEditMode(true);
    setManualAfterText(afterCorrection);
  };

  const handleConfirmManualFix = async () => {
    if (!fixData) {
      setFixErrorMessage("No fix context for manual edit.");
      return;
    }

    let updatedEdi = fixData.fixed_edi;

    const originalAfter = fixData.after_line || "";
    if (manualAfterText && originalAfter) {
      const escaped = originalAfter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      updatedEdi = updatedEdi.replace(new RegExp(escaped), manualAfterText);
    } else {
      // fallback row-based replacement
      const rowIndex = selectedError ? selectedError.row - 1 : -1;
      if (rowIndex >= 0 && rawEDI[rowIndex] !== undefined) {
        const rawLines = currentEdi.replace(/\n/g, "").split("~");
        if (rowIndex < rawLines.length) {
          rawLines[rowIndex] = manualAfterText;
          updatedEdi = rawLines.join("~") + "~";
        }
      }
    }

    await applyEdiFromFix(updatedEdi);
  };

  return (

    <section id="demo" className="py-16 bg-gray-50">

      <div className="max-w-7xl mx-auto px-6">

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-400 rounded-xl p-12 text-center mb-10 bg-white"
        >

          <Upload className="mx-auto mb-4 text-gray-700" size={42} />

          <h2 className="text-2xl font-bold text-gray-900">
            Upload EDI File
          </h2>

          <p className="text-gray-700 mt-2">
            Drag & Drop or Upload manually
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 btn-upload-main"
          >
            Upload File
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".edi,.txt,.dat,.x12"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />

        </div>

        {loading && (
          <p className="text-center text-lg text-gray-700">
            Parsing EDI File...
          </p>
        )}

        {metadata.length > 0 && (

          <div className="space-y-8">

            {/* ✅ DYNAMIC METADATA FIX */}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

              {metadata.map((meta, i) => (

                Object.entries(meta).map(([key, value]) => (

                  <div
                    key={i + key}
                    className="border rounded-lg p-5 bg-white shadow"
                  >

                    <p className="text-gray-600 text-sm">
                      {key.replace(/_/g, " ").toUpperCase()}
                    </p>

                    <p className="font-semibold text-lg text-gray-900">
                      {String(value) || "Unknown"}
                    </p>

                  </div>

                ))

              ))}

            </div>

            {/* TABS */}

            <div className="flex gap-8 border-b text-lg font-semibold">

              <button
                onClick={() => setActiveTab("segments")}
                className={`pb-2 ${
                  activeTab === "segments"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-700"
                }`}
              >
                Segments
              </button>

              <button
                onClick={() => setActiveTab("errors")}
                className={`pb-2 ${
                  activeTab === "errors"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-700"
                }`}
              >
                Errors ({errors.length})
              </button>

            </div>

            {/* SEGMENTS TAB */}

            {activeTab === "segments" && (

              <div className="grid grid-cols-[300px_1fr] gap-6">

                <div className="border rounded-lg p-4 bg-white h-[520px] overflow-auto shadow">

                  {segments.map((seg, i) => (

                    <div
                      key={i}
                      onClick={() => setSelectedRow(seg.row)}
                      className={`cursor-pointer px-3 py-2 rounded font-mono text-base ${
                        selectedRow === seg.row
                          ? "bg-blue-100 text-blue-800"
                          : "hover:bg-gray-200 text-gray-900"
                      }`}
                    >

                      {seg.segment_id} (Row {seg.row})

                    </div>

                  ))}

                </div>

                <div className="border rounded-lg p-6 bg-white shadow font-mono">

                  {selectedLine ? (

                    <div>

                      <div className="flex gap-4 mb-6 text-lg">

                        <span className="text-gray-500 w-10">
                          {selectedRow}
                        </span>

                        <span className="text-gray-900 break-all">
                          {selectedLine}~
                        </span>

                      </div>

                      <div className="space-y-1">

                        {selectedSegment?.elements?.map((el: any, i: number) => {

                          const errorHere = errors.find(
                            e =>
                              e.row === selectedRow &&
                              e.column === el.column
                          );

                          return (

                            <div
                              key={i}
                              className={`flex gap-4 px-2 py-1 rounded text-base ${
                                errorHere
                                  ? "bg-red-200 text-red-800"
                                  : "text-gray-900"
                              }`}
                            >

                              <span className="w-20 text-gray-500">
                                Col {el.column}
                              </span>

                              <span>
                                {el.value || "(empty)"}
                              </span>

                            </div>

                          );

                        })}

                      </div>

                    </div>

                  ) : (

                    <p className="text-gray-700 text-lg">
                      Select a segment to view details
                    </p>

                  )}

                </div>

              </div>

            )}

            {/* ERROR TAB */}

            {activeTab === "errors" && (

              <div className="space-y-4">

                {errors.length === 0 ? (

                  <div className="flex items-center gap-2 text-green-700 text-lg">

                    <CheckCircle size={20}/>
                    No validation errors found

                  </div>

                ) : (

                  errors.map((err, i) => {

                    const line = rawEDI[err.row - 1];

                    return (

                      <div
                        key={i}
                        className="border border-red-400 bg-red-50 rounded-lg p-4"
                      >

                        <p className="font-mono text-gray-900 mb-2">
                          Row {err.row} → {line}~
                        </p>

                        <div className="flex items-center gap-2 mb-1">

                          <AlertCircle className="text-red-700"/>

                          <p className="font-semibold text-red-700">
                            {err.code}
                          </p>

                        </div>

                        <p className="text-gray-800 mb-3">
                          {err.description}
                        </p>

                        <button
                          onClick={() => handleFixButton(err)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          <Wrench size={16}/>
                          Fix
                        </button>

                      </div>

                    );

                  })

                )}

              </div>

            )}

          </div>

        )}

      </div>

      {showFixPopup && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-white w-[700px] rounded-xl shadow-2xl p-8">

            <div className="flex justify-between mb-6">

              <h2 className="text-2xl font-bold text-gray-900">
                Suggested Correction
              </h2>

              <button
                onClick={() => setShowFixPopup(false)}
                className="p-1 rounded hover:bg-red-100"
              >
                <X className="text-red-600 hover:text-red-800" size={24}/>
              </button>

            </div>

            <div className="mb-6">

              <p className="font-semibold text-red-700 mb-2">
                Before Correction
              </p>

              <div className="font-mono bg-red-50 border border-red-400 text-red-900 p-4 rounded">
                {beforeCorrection}~
              </div>

            </div>

            <div className="mb-2 text-sm text-red-600">
              {fixErrorMessage}
            </div>

            <div className="mb-8">

              <p className="font-semibold text-green-700 mb-2">
                After Correction
              </p>

              {manualEditMode ? (
                <textarea
                  className="w-full h-32 p-2 font-mono bg-white border border-green-400 text-green-900 rounded"
                  value={manualAfterText}
                  onChange={(e) => setManualAfterText(e.target.value)}
                />
              ) : (
                <div className="font-mono bg-green-50 border border-green-400 text-green-900 p-4 rounded">
                  {afterCorrection}~
                </div>
              )}

            </div>

            <div className="flex justify-end gap-4">

              <button
                onClick={handleAcceptFix}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Accept
              </button>

              <button
                onClick={handleDeclineFix}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Decline
              </button>

              {manualEditMode ? (
                <>
                  <button
                    onClick={handleConfirmManualFix}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Apply Manual Fix
                  </button>

                  <button
                    onClick={() => setManualEditMode(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel Manual
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStartManualEdit}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Fix Manually
                </button>
              )}

            </div>

          </div>

        </div>

      )}

    </section>

  );

}