import React, { useState, useEffect, useRef, useMemo } from "react";
import { Loader2, X } from "lucide-react";
import styles from "../../styles/pages_css/DataHub.module.css";
import { useLazyGetDatasetDataQuery } from "../../redux/api/datasetApiSlice";
import DataExplorerGrid from "../DataExplorerGrid";

const DatasetViewModal = ({ isOpen, onClose, dataset }) => {
  const [activeSheet, setActiveSheet] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [datasetData, setDatasetData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const isFetchingRef = useRef(false);

  const [triggerGetData, { isFetching }] = useLazyGetDatasetDataQuery();

  useEffect(() => {
    if (dataset && dataset.sheets && dataset.sheets.length > 0) {
      setActiveSheet(dataset.sheets[0]);
    }
  }, [dataset]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (dataset?._id && activeSheet && isOpen) {
      setPage(1);
      isFetchingRef.current = true;
      triggerGetData({
        datasetId: dataset._id,
        sheet: activeSheet,
        page: 1,
        limit: 100,
        search: debouncedSearch,
      }).then((res) => {
        isFetchingRef.current = false;
        if (res.data?.success) {
          setDatasetData(res.data.data);
          setHasMore(res.data.hasMore);
        }
      });
    } else {
      setDatasetData([]);
    }
  }, [dataset?._id, activeSheet, debouncedSearch, isOpen, triggerGetData]);

  const loadMore = () => {
    if (isFetchingRef.current || !hasMore || !dataset?._id || !activeSheet)
      return;
    const nextPage = page + 1;
    isFetchingRef.current = true;
    triggerGetData({
      datasetId: dataset._id,
      sheet: activeSheet,
      page: nextPage,
      limit: 100,
      search: debouncedSearch,
    }).then((res) => {
      isFetchingRef.current = false;
      if (res.data?.success) {
        setDatasetData((prev) => {
          const existingIds = new Set(prev.map((item) => item._originalIndex));
          const newItems = res.data.data.filter(
            (item) => !existingIds.has(item._originalIndex),
          );
          return [...prev, ...newItems];
        });
        setHasMore(res.data.hasMore);
        setPage(nextPage);
      }
    });
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      loadMore();
    }
  };

  const allHeaders = useMemo(() => {
    return datasetData.length > 0
      ? Object.keys(datasetData[0]).filter((k) => k !== "_originalIndex")
      : [];
  }, [datasetData]);

  if (!isOpen || !dataset) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        style={{
          width: "90%",
          maxWidth: "1200px",
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          padding: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={styles.modalHeader}
          style={{ padding: "1.5rem", paddingBottom: "1rem" }}
        >
          <h2 style={{ margin: 0 }}>{dataset.title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {dataset.sheets && dataset.sheets.length > 1 && (
          <div
            style={{
              padding: "0 1.5rem",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              gap: "1rem",
            }}
          >
            {dataset.sheets.map((sheet) => (
              <button
                key={sheet}
                onClick={() => {
                  if (activeSheet !== sheet) {
                    setActiveSheet(sheet);
                    setSearchQuery("");
                  }
                }}
                style={{
                  padding: "0.5rem 1rem",
                  background:
                    activeSheet === sheet
                      ? "var(--brand-primary)"
                      : "transparent",
                  color: activeSheet === sheet ? "#fff" : "var(--text-primary)",
                  border: "none",
                  borderBottom:
                    activeSheet === sheet
                      ? "3px solid var(--brand-primary)"
                      : "3px solid transparent",
                  cursor: "pointer",
                  fontWeight: activeSheet === sheet ? "bold" : "normal",
                }}
              >
                {sheet}
              </button>
            ))}
          </div>
        )}

        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <DataExplorerGrid
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            datasetData={datasetData}
            allHeaders={allHeaders}
            hideCheckboxes={true}
            isFetching={isFetching}
            handleScroll={handleScroll}
          />
        </div>
      </div>
    </div>
  );
};

export default DatasetViewModal;
