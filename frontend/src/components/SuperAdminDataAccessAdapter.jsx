import React, { useState, useEffect } from "react";
import SharedDataAccess from "./SharedDataAccess";
import {
  useGetOrganizationsQuery,
  useGetQuizzesQuery,
  useUpdateQuizAccessMutation,
  useGetSuperAdminDatasetsQuery,
  useUpdateDatasetAccessMutation,
} from "../redux/api/superAdminApiSlice";

const SuperAdminDataAccessAdapter = () => {
  const [tableSearch, setTableSearch] = useState("");
  const [debouncedTableSearch, setDebouncedTableSearch] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [entitySearch, setEntitySearch] = useState("");
  const [debouncedEntitySearch, setDebouncedEntitySearch] = useState("");
  const [entityPage, setEntityPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTableSearch(tableSearch);
      setTablePage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [tableSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedEntitySearch(entitySearch);
      setEntityPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [entitySearch]);

  const { data: orgData, isLoading: isFetchingEntities } =
    useGetOrganizationsQuery({
      page: entityPage,
      limit: 20,
      search: debouncedEntitySearch,
    });

  const {
    data: quizData,
    isLoading: isLoadingQuizzes,
    refetch: refetchQuizzes,
  } = useGetQuizzesQuery({
    page: tablePage,
    limit: 10,
    search: debouncedTableSearch,
  });
  const [updateQuizAccess] = useUpdateQuizAccessMutation();

  const {
    data: datasetData,
    isLoading: isLoadingDatasets,
    refetch: refetchDatasets,
  } = useGetSuperAdminDatasetsQuery({
    page: tablePage,
    limit: 10,
    search: debouncedTableSearch,
  });
  const [updateDatasetAccess] = useUpdateDatasetAccessMutation();

  const handleUpdateQuizAccess = async (data) => {
    await updateQuizAccess(data).unwrap();
    refetchQuizzes();
  };

  const handleUpdateDatasetAccess = async (data) => {
    await updateDatasetAccess(data).unwrap();
    refetchDatasets();
  };

  const entities = (orgData?.organizations || []).filter(
    (org) =>
      !entitySearch ||
      (org.organization_name &&
        org.organization_name
          .toLowerCase()
          .includes(entitySearch.toLowerCase())) ||
      (org.domain &&
        org.domain.toLowerCase().includes(entitySearch.toLowerCase())),
  );

  return (
    <SharedDataAccess
      quizzes={quizData?.quizzes || []}
      datasets={datasetData?.datasets || []}
      quizzesTotalPages={quizData?.totalPages || 1}
      datasetsTotalPages={datasetData?.totalPages || 1}
      isLoadingQuizzes={isLoadingQuizzes}
      isLoadingDatasets={isLoadingDatasets}
      tableSearch={tableSearch}
      setTableSearch={setTableSearch}
      tablePage={tablePage}
      setTablePage={setTablePage}
      entities={entities}
      isFetchingEntities={isFetchingEntities}
      entitySearch={entitySearch}
      setEntitySearch={setEntitySearch}
      entityPage={entityPage}
      setEntityPage={setEntityPage}
      onUpdateQuizAccess={handleUpdateQuizAccess}
      onUpdateDatasetAccess={handleUpdateDatasetAccess}
      entityName="Organizations"
      entityKey="allowed_organizations"
      roleDescription="Control which organizations have permission to view and use specific quizzes and datasets. Manage global vs restricted access."
    />
  );
};

export default SuperAdminDataAccessAdapter;
