import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import { ColumnType, Task } from "./types";

interface Props {
  column: ColumnType;
  onTaskClick?: (task: Task) => void;
}

export default function Column({ column, onTaskClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
          {column.title}
        </h3>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {column.tasks.length}
        </span>
      </div>

      <SortableContext
        items={column.tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`flex-1 min-h-[200px] max-h-[calc(100vh-280px)] flex-col gap-2 overflow-y-auto rounded-xl p-2 transition-colors ${
            isOver
              ? "bg-brand-50 dark:bg-white/[0.05]"
              : "bg-gray-50 dark:bg-white/[0.02]"
          }`}
        >
          <div className="flex flex-col gap-2">
            {column.tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onClick={() => onTaskClick?.(task)}
              />
            ))}
          </div>

          {column.tasks.length === 0 && (
            <div className="flex h-[100px] items-center justify-center">
              <p className="text-xs text-gray-400">
                Arrastra tareas aquí
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}