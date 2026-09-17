import { queryOptions } from "@tanstack/react-query";
import {
  getAnnouncements,
  getMyFees,
  getMyGrades,
  getMyProfile,
  getMyTimetable,
  getPublicAnnouncements,
} from "./portal.functions";

export const publicAnnouncementsQuery = queryOptions({
  queryKey: ["announcements", "public"],
  queryFn: () => getPublicAnnouncements(),
  staleTime: 60_000,
});

export const profileQuery = queryOptions({
  queryKey: ["portal", "profile"],
  queryFn: () => getMyProfile(),
});

export const gradesQuery = queryOptions({
  queryKey: ["portal", "grades"],
  queryFn: () => getMyGrades(),
});

export const timetableQuery = queryOptions({
  queryKey: ["portal", "timetable"],
  queryFn: () => getMyTimetable(),
});

export const feesQuery = queryOptions({
  queryKey: ["portal", "fees"],
  queryFn: () => getMyFees(),
});

export const announcementsQuery = queryOptions({
  queryKey: ["portal", "announcements"],
  queryFn: () => getAnnouncements(),
});

export const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const formatKES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

export const formatTime = (t: string) => t.slice(0, 5);
