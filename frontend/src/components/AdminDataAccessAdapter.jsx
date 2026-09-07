import React, { useState, useEffect } from "react";
import SharedDataAccess from "./SharedDataAccess";
import {
  useGetAdminQuizzesQuery,
  useGetAdminDatasetsQuery,
  useUpdateAdminQuizAccessMutation,
  useUpdateAdminDatasetAccessMutation,
  useGetOrganizationTeachersQuery,
} from "../redux/api/adminApiSlice";

const AdminDataAccessAdapter = () => {
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

  const { data: teachersData, isLoading: isFetchingEntities } =
    useGetOrganizationTeachersQuery({
      page: entityPage,
      limit: 20,
      search: debouncedEntitySearch,
    });

  const {
    data: quizData,
    isLoading: isLoadingQuizzes,
    refetch: refetchQuizzes,
  } = useGetAdminQuizzesQuery({
    page: tablePage,
    limit: 10,
    search: debouncedTableSearch,
  });
  const [updateQuizAccess] = useUpdateAdminQuizAccessMutation();

  const {
    data: datasetData,
    isLoading: isLoadingDatasets,
    refetch: refetchDatasets,
  } = useGetAdminDatasetsQuery({
    page: tablePage,
    limit: 10,
    search: debouncedTableSearch,
  });
  const [updateDatasetAccess] = useUpdateAdminDatasetAccessMutation();

  const handleUpdateQuizAccess = async (data) => {
    await updateQuizAccess(data).unwrap();
    refetchQuizzes();
  };

  const handleUpdateDatasetAccess = async (data) => {
    await updateDatasetAccess(data).unwrap();
    refetchDatasets();
  };

  const entities = (teachersData || []).filter(
    (t) =>
      !entitySearch ||
      t.name.toLowerCase().includes(entitySearch.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(entitySearch.toLowerCase())),
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
      entityName="Teachers"
      entityKey="allowed_teachers"
      roleDescription="Control which teachers have permission to view and use specific quizzes and datasets."
    />
  );
};

export default AdminDataAccessAdapter;
