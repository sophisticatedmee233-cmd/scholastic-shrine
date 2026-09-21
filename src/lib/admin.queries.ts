import { queryOptions } from "@tanstack/react-query";
import { adminListAccounts, adminListFees, adminListGrades, adminListParentLinks, adminListStudents, getMyAccess } from "./admin.functions";
import { getChildRecords, getMyChildren, getMyGuardians } from "./parent.functions";

export const accessQuery = queryOptions({
  queryKey: ["portal", "access"],
  queryFn: () => getMyAccess(),
});

export const adminStudentsQuery = queryOptions({
  queryKey: ["admin", "students"],
  queryFn: () => adminListStudents(),
});

export const adminParentLinksQuery = queryOptions({
  queryKey: ["admin", "parent-links"],
  queryFn: () => adminListParentLinks(),
});

export const adminGradesQuery = (studentId: string) =>
  queryOptions({
    queryKey: ["admin", "grades", studentId],
    queryFn: () => adminListGrades({ data: { studentId } }),
    enabled: Boolean(studentId),
  });

export const adminFeesQuery = (studentId: string) =>
  queryOptions({
    queryKey: ["admin", "fees", studentId],
    queryFn: () => adminListFees({ data: { studentId } }),
    enabled: Boolean(studentId),
  });

export const childrenQuery = queryOptions({
  queryKey: ["parent", "children"],
  queryFn: () => getMyChildren(),
});

export const guardiansQuery = queryOptions({
  queryKey: ["portal", "guardians"],
  queryFn: () => getMyGuardians(),
});

export const childRecordsQuery = (studentId: string) =>
  queryOptions({
    queryKey: ["parent", "child", studentId],
    queryFn: () => getChildRecords({ data: { studentId } }),
    enabled: Boolean(studentId),
  });

export const adminAccountsQuery = queryOptions({
  queryKey: ["admin", "accounts"],
  queryFn: () => adminListAccounts(),
});
