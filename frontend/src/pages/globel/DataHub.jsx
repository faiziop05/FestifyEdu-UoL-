import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import styles from "../../styles/pages_css/DataHub.module.css";
import AdminDataAccessAdapter from "../../components/AdminDataAccessAdapter";
import SuperAdminDataAccessAdapter from "../../components/SuperAdminDataAccessAdapter";
import DataHubHeader from "../../components/DataHub/DataHubHeader";
import DataHubTabs from "../../components/DataHub/DataHubTabs";
import DatasetGrid from "../../components/DataHub/DatasetGrid";
import DriveImportModal from "../../components/DataHub/DriveImportModal";
import DatasetViewModal from "../../components/DataHub/DatasetViewModal";

import {
  useGetDatasetsQuery,
  useCreateDatasetMutation,
  useDeleteDatasetMutation,
  useLazyGetDatasetExportQuery,
} from "../../redux/api/datasetApiSlice";
import {
  useLazyGetDriveAuthUrlQuery,
  useLazyGetDriveFilesQuery,
  useImportDriveFileMutation,
} from "../../redux/api/driveApiSlice";

const DataHub = () => {
  const { user } = useSelector((state) => state.auth);
  const [driveFiles, setDriveFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [importingFileId, setImportingFileId] = useState(null);
  const [activeTab, setActiveTab] = useState("datasets");
  const fileInputRef = useRef(null);

  const {
    data: datasetsData,
    isLoading: loading,
    refetch: fetchDatasets,
  } = useGetDatasetsQuery(user?._id, { skip: !user?._id });
  const datasets = datasetsData?.datasets || [];
  const ownedDatasets = datasets.filter((ds) => ds.teacher_id === user?._id);
  const sharedDatasets = datasets.filter((ds) => ds.teacher_id !== user?._id);

  const [createDataset] = useCreateDatasetMutation();
  const [deleteDataset] = useDeleteDatasetMutation();
  const [getDatasetExport] = useLazyGetDatasetExportQuery();

  const [getDriveAuthUrl] = useLazyGetDriveAuthUrlQuery();
  const [getDriveFiles] = useLazyGetDriveFilesQuery();
  const [importDriveFile] = useImportDriveFileMutation();
  const handleConnectGoogleDrive = async () => {
    try {
      const data = await getDriveAuthUrl(user._id).unwrap();
      if (data.url) {
        // Open OAuth in popup
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(
          data.url,
          "Google Drive Auth",
          `width=${width},height=${height},top=${top},left=${left}`,
        );
      }
    } catch (error) {
      console.error("Error connecting to Google Drive:", error);
    }
  };

  const loadDriveFiles = async () => {
    try {
      const data = await getDriveFiles(user._id).unwrap();
      if (Array.isArray(data)) {
        setDriveFiles(data);
        setIsModalOpen(true);
      } else {
        alert("Received unexpected data format from Google Drive.");
      }
    } catch (error) {
      if (error.status === 401) {
        alert("Please connect your Google Drive first.");
      } else {
        alert(
          "Error from Google Drive: " +
            (error?.data?.message ||
              error?.data?.error ||
              "Please try reconnecting."),
        );
      }
      console.error("Error fetching drive files:", error);
    }
  };

  const handleImportFile = async (file) => {
    try {
      setImportingFileId(file.id);
      // 1. Download and parse file from drive
      const importData = await importDriveFile({
        fileId: file.id,
        userId: user._id,
      }).unwrap();

      if (!importData.success) throw new Error(importData.message);

      // 2. Save entire workbook as a single dataset in our DB
      const sheetNames = Object.keys(importData.data);
      if (sheetNames.length === 0) {
        alert("The selected file is empty.");
        return;
      }

      const firstSheet = importData.data[sheetNames[0]];
      const headers = firstSheet.length > 0 ? Object.keys(firstSheet[0]) : [];

      const createData = await createDataset({
        teacher_id: user._id,
        title: importData.fileName,
        google_drive_file_id: file.id,
        headers,
        parsed_data: importData.data, // Storing the entire { sheet1: [...], sheet2: [...] }
      }).unwrap();

      if (createData.success) {
        setIsModalOpen(false);
      } else {
        alert("Failed to save dataset to database.");
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import file. Please try again.");
    } finally {
      setImportingFileId(null);
    }
  };

  const handleDeleteDataset = async (datasetId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this dataset? This action cannot be undone.",
      )
    )
      return;

    try {
      const data = await deleteDataset(datasetId).unwrap();
      if (!data.success) {
        alert(data.message || "Failed to delete dataset");
      }
    } catch (error) {
      console.error("Error deleting dataset:", error);
      alert("Failed to delete dataset");
    }
  };

  const handleLocalFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: "binary" });

          const parsedData = {};
          wb.SheetNames.forEach((name) => {
            parsedData[name] = XLSX.utils.sheet_to_json(wb.Sheets[name]);
          });

          const firstSheet = parsedData[wb.SheetNames[0]];
          const headers =
            firstSheet && firstSheet.length > 0
              ? Object.keys(firstSheet[0])
              : [];

          const createData = await createDataset({
            teacher_id: user._id,
            title: file.name,
            google_drive_file_id: null,
            headers,
            parsed_data: parsedData,
          }).unwrap();

          if (!createData.success) {
            alert("Failed to save dataset");
          }
        } catch (innerError) {
          console.error("Local import error during parsing/saving", innerError);
          alert("Failed to parse and save local file.");
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Local import failed", error);
      alert("Failed to process local file.");
    }

    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportExcel = async (dataset) => {
    try {
      const { data: exportData } = await getDatasetExport(dataset._id);

      if (!exportData || !exportData.parsed_data) {
        alert("Failed to retrieve dataset for export.");
        return;
      }

      const wb = XLSX.utils.book_new();
      if (Object.keys(exportData.parsed_data).length > 0) {
        Object.keys(exportData.parsed_data).forEach((sheetName) => {
          const ws = XLSX.utils.json_to_sheet(
            exportData.parsed_data[sheetName],
          );
          // Sheet names cannot exceed 31 chars
          XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
        });
      } else {
        alert("Dataset has no data to export.");
        return;
      }

      let filename = dataset.title || "dataset";
      if (!filename.endsWith(".xlsx")) filename += ".xlsx";

      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export dataset to Excel.");
    }
  };

  return (
    <div className={styles.dataHubContainer}>
      <DataHubHeader
        user={user}
        handleConnectGoogleDrive={handleConnectGoogleDrive}
        fileInputRef={fileInputRef}
        handleLocalFileChange={handleLocalFileChange}
        loadDriveFiles={loadDriveFiles}
      />

      <DataHubTabs
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "datasets" ? (
        <>
          <DatasetGrid
            title="Your Imported Data"
            datasets={ownedDatasets}
            loading={loading}
            emptyMessage={{
              title: "No Imported Datasets",
              description: "Import an Excel or CSV file from Google Drive to get started."
            }}
            showDelete={true}
            handleExportExcel={handleExportExcel}
            handleDeleteDataset={handleDeleteDataset}
            onDatasetClick={(dataset) => {
              setSelectedDataset(dataset);
              setIsViewModalOpen(true);
            }}
          />

          {sharedDatasets.length > 0 && (
            <DatasetGrid
              title="Shared With You"
              datasets={sharedDatasets}
              loading={loading}
              emptyMessage={{
                title: "No Shared Datasets",
                description: "You don't have any shared datasets yet."
              }}
              showDelete={false}
              handleExportExcel={handleExportExcel}
              onDatasetClick={(dataset) => {
                setSelectedDataset(dataset);
                setIsViewModalOpen(true);
              }}
            />
          )}

          <DriveImportModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            driveFiles={driveFiles}
            handleImportFile={handleImportFile}
            importingFileId={importingFileId}
          />
          
          <DatasetViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            dataset={selectedDataset}
          />
        </>
      ) : (
        <div style={{ marginTop: "1rem" }}>
          {user?.role === "super_admin" ? (
            <SuperAdminDataAccessAdapter />
          ) : (
            <AdminDataAccessAdapter />
          )}
        </div>
      )}
    </div>
  );
};

export default DataHub;
