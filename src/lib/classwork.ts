import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Assignment = Database["public"]["Tables"]["assignments"]["Row"];
export type VideoClass = Database["public"]["Tables"]["video_classes"]["Row"];

export const CLASSES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

export const assignmentsQuery = (className?: string) =>
  queryOptions({
    queryKey: ["classwork", "assignments", className ?? "all"],
    queryFn: async () => {
      let q = supabase.from("assignments").select("*").order("due_date");
      if (className) q = q.eq("class_name", className);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const videoClassesQuery = (className?: string) =>
  queryOptions({
    queryKey: ["classwork", "video", className ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("video_classes")
        .select("*")
        .gte("starts_at", new Date(Date.now() - 3 * 3600_000).toISOString())
        .order("starts_at");
      if (className) q = q.eq("class_name", className);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const newMeetingUrl = () =>
  `https://meet.jit.si/DanielsPrimary-${crypto.randomUUID().slice(0, 13).replace(/-/g, "")}`;

export const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-KE", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
