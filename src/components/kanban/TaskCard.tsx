import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "./types";

interface Props {
  task: Task;
  isOverlay?: boolean;
  onClick?: () => void;
}

export default function TaskCard({ task, isOverlay = false, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const badgeColor = {
    LOW: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
    HIGH: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow active:cursor-grabbing dark:border-gray-800 dark:bg-white/[0.03] ${
        isDragging ? "opacity-40" : ""
      } ${isOverlay ? "rotate-3 shadow-lg" : ""}`}
    >
      <h4 className="text-sm font-medium text-gray-800 dark:text-white line-clamp-2">
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-1 text-xs text-gray-500 line-clamp-1">
          {task.description}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor[task.priority]}`}
        >
          {task.priority === "LOW" && "🟢 Baja"}
          {task.priority === "MEDIUM" && "🟡 Media"}
          {task.priority === "HIGH" && "🔴 Alta"}
        </span>
      </div>
    </div>
  );
}