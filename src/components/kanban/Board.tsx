"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Column from "./Column";
import TaskCard from "./TaskCard";
import { ColumnType, Task } from "./types";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";

const initialColumns: ColumnType[] = [
  {
    id: "backlog",
    title: "Backlog",
    tasks: [
      { id: "1", title: "Diseñar Dashboard", priority: "HIGH" },
      { id: "5", title: "Revisar requerimientos", priority: "MEDIUM" },
      { id: "8", title: "Planificar sprints", priority: "LOW" },
    ],
  },
  {
    id: "todo",
    title: "Por Hacer",
    tasks: [
      { id: "2", title: "Crear Kanban", priority: "MEDIUM" },
      { id: "6", title: "Configurar rutas", priority: "LOW" },
      { id: "9", title: "Diseñar base de datos", priority: "HIGH" },
    ],
  },
  {
    id: "progress",
    title: "En Progreso",
    tasks: [
      { id: "3", title: "Integrar API", priority: "HIGH" },
      { id: "7", title: "Crear componentes", priority: "MEDIUM" },
    ],
  },
  {
    id: "done",
    title: "Hecho",
    tasks: [
      { id: "4", title: "Configurar TailAdmin", priority: "LOW" },
    ],
  },
];

export default function Board() {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [taskDescription, setTaskDescription] = useState("");
  const { isOpen, openModal, closeModal } = useModal();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;
    const task = columns
      .flatMap((c) => c.tasks)
      .find((t) => t.id === activeId);
    setActiveTask(task ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    setColumns((prev) => {
      const activeColumn = prev.find((c) =>
        c.tasks.some((t) => t.id === activeId)
      );
      const overColumn =
        prev.find((c) => c.id === overId) ??
        prev.find((c) => c.tasks.some((t) => t.id === overId));

      if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
        return prev;
      }

      const movingTask = activeColumn.tasks.find((t) => t.id === activeId);
      if (!movingTask) return prev;

      const overIsColumn = prev.some((c) => c.id === overId);
      const overIndex = overColumn.tasks.findIndex((t) => t.id === overId);
      const newIndex = overIsColumn
        ? overColumn.tasks.length
        : overIndex >= 0
        ? overIndex
        : overColumn.tasks.length;

      return prev.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== activeId),
          };
        }
        if (col.id === overColumn.id) {
          const newTasks = [...col.tasks];
          newTasks.splice(newIndex, 0, movingTask);
          return { ...col, tasks: newTasks };
        }
        return col;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    setColumns((prev) => {
      const activeColumn = prev.find((c) =>
        c.tasks.some((t) => t.id === activeId)
      );
      const overColumn =
        prev.find((c) => c.id === overId) ??
        prev.find((c) => c.tasks.some((t) => t.id === overId));

      if (!activeColumn || !overColumn || activeColumn.id !== overColumn.id) {
        return prev;
      }

      const oldIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
      const newIndex = activeColumn.tasks.findIndex((t) => t.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return prev;
      }

      return prev.map((col) =>
        col.id === activeColumn.id
          ? { ...col, tasks: arrayMove(col.tasks, oldIndex, newIndex) }
          : col
      );
    });
  };

  const handleAddTask = () => {
    resetModalFields();
    openModal();
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskTitle(task.title);
    setTaskPriority(task.priority);
    setTaskDescription(task.description || "");
    openModal();
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim()) return;

    if (selectedTask) {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) =>
            t.id === selectedTask.id
              ? {
                  ...t,
                  title: taskTitle,
                  priority: taskPriority,
                  description: taskDescription || undefined,
                }
              : t
          ),
        }))
      );
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskTitle,
        priority: taskPriority,
        description: taskDescription || undefined,
      };
      setColumns((prev) =>
        prev.map((col) =>
          col.id === "backlog"
            ? { ...col, tasks: [...col.tasks, newTask] }
            : col
        )
      );
    }
    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setTaskTitle("");
    setTaskPriority("MEDIUM");
    setTaskDescription("");
    setSelectedTask(null);
  };

  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Tablero Kanban
          </h2>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {totalTasks} tareas
          </span>
        </div>
        <button
          onClick={handleAddTask}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Tarea
        </button>
      </div>

      <div className="w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((column) => (
              <Column 
                key={column.id} 
                column={column} 
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {selectedTask ? "Editar Tarea" : "Nueva Tarea"}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedTask
                ? "Actualiza los detalles de tu tarea"
                : "Agrega una nueva tarea al tablero"}
            </p>
          </div>

          <div className="mt-8">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Título de la Tarea
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Ej: Implementar autenticación"
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Descripción
              </label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Describe los detalles de la tarea..."
                rows={3}
                className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div className="mt-6">
              <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                Prioridad
              </label>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                {[
                  { value: "LOW", label: "Baja", color: "green" },
                  { value: "MEDIUM", label: "Media", color: "yellow" },
                  { value: "HIGH", label: "Alta", color: "red" },
                ].map((priority) => (
                  <div key={priority.value} className="n-chk">
                    <div className="form-check form-check-inline">
                      <label
                        className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                        htmlFor={`priority-${priority.value}`}
                      >
                        <span className="relative">
                          <input
                            className="sr-only form-check-input"
                            type="radio"
                            name="task-priority"
                            value={priority.value}
                            id={`priority-${priority.value}`}
                            checked={taskPriority === priority.value}
                            onChange={() => setTaskPriority(priority.value as "LOW" | "MEDIUM" | "HIGH")}
                          />
                          <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                            <span
                              className={`h-2 w-2 rounded-full bg-white ${
                                taskPriority === priority.value ? "block" : "hidden"
                              }`}
                            ></span>
                          </span>
                        </span>
                        {priority.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={closeModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveTask}
              type="button"
              className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {selectedTask ? "Actualizar" : "Agregar Tarea"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}