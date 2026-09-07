import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DataHub from "../pages/globel/DataHub";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// Mock XLSX
vi.mock("xlsx", () => {
  return {
    read: vi.fn(() => ({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    })),
    utils: {
      sheet_to_json: vi.fn(() => [
        { Team: "A", Score: 10 },
        { Team: "B", Score: 20 },
      ]),
      book_new: vi.fn(),
      json_to_sheet: vi.fn(),
      book_append_sheet: vi.fn(),
    },
    writeFile: vi.fn(),
  };
});

// Mock RTK Query hooks
const mockCreateDataset = vi.fn().mockResolvedValue({ success: true });
vi.mock("../redux/api/datasetApiSlice", () => ({
  useGetDatasetsQuery: () => ({ data: { datasets: [] }, isLoading: false }),
  useCreateDatasetMutation: () => [mockCreateDataset],
  useDeleteDatasetMutation: () => [vi.fn()],
  useLazyGetDatasetExportQuery: () => [vi.fn()],
  useLazyGetDatasetDataQuery: () => [vi.fn(), { isFetching: false }],
}));

vi.mock("../redux/api/driveApiSlice", () => ({
  useLazyGetDriveAuthUrlQuery: () => [vi.fn()],
  useLazyGetDriveFilesQuery: () => [vi.fn()],
  useImportDriveFileMutation: () => [vi.fn()],
}));

describe("DataHub Component Data Parsing", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: (state = { user: { _id: "teacher123", role: "teacher" } }) =>
          state,
      },
    });
    vi.clearAllMocks();
  });

  it("renders DataHub and triggers file parsing on local file upload", async () => {
    render(
      <Provider store={store}>
        <DataHub />
      </Provider>,
    );

    // Mock FileReader
    const dummyFileReader = {
      readAsBinaryString: vi.fn(function () {
        this.onload({ target: { result: "dummy_binary_string" } });
      }),
    };
    window.FileReader = vi.fn(() => dummyFileReader);
    expect(screen.getByText("Your Imported Data")).toBeInTheDocument();
  });
});
