import Board from "@/components/kanban/Board";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Kanban Board | TaskSystem - Dashboard Template",
  description:
    "Gestión visual de tareas estilo Trello para TaskSystem",
};

export default function KanbanPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Kanban Board" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] lg:p-5">
        <Board />
      </div>
    </div>
  );
}