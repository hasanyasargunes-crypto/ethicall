"use client";

import { useState } from "react";
import { Inbox, GripVertical } from "lucide-react";

export type KanbanColumn = {
  key: string;
  label: string;
  dotColor: string;
  bgColor: string;
};

export type KanbanItem = {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
  badge?: { label: string; color: string };
  meta?: string;
  href?: string;
};

type Props = {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onStatusChange?: (itemId: string, newStatus: string) => void;
  onItemClick?: (item: KanbanItem) => void;
  emptyText?: string;
};

export default function KanbanBoard({ columns, items, onStatusChange, onItemClick, emptyText = "Henüz kayıt yok" }: Props) {
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  function handleDragStart(e: React.DragEvent, itemId: string) {
    setDragItem(itemId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, columnKey: string) {
    e.preventDefault();
    setDragOverColumn(columnKey);
  }

  function handleDrop(e: React.DragEvent, columnKey: string) {
    e.preventDefault();
    if (dragItem && onStatusChange) {
      onStatusChange(dragItem, columnKey);
    }
    setDragItem(null);
    setDragOverColumn(null);
  }

  function handleDragEnd() {
    setDragItem(null);
    setDragOverColumn(null);
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <Inbox className="h-12 w-12 text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-400">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const colItems = items.filter((i) => i.status === col.key);
        const isOver = dragOverColumn === col.key;
        return (
          <div
            key={col.key}
            className={`kanban-column transition-colors ${isOver ? "bg-brand-50/50 ring-2 ring-brand-200" : ""}`}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDrop={(e) => handleDrop(e, col.key)}
            onDragLeave={() => setDragOverColumn(null)}
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
              <span className="text-[13px] font-semibold text-gray-700">{col.label}</span>
              <span className="text-[11px] font-medium text-gray-400 ml-auto">{colItems.length}</span>
            </div>
            <div className="space-y-2 flex-1 min-h-[100px]">
              {colItems.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onItemClick?.(item)}
                  className={`kanban-card ${dragItem === item.id ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 text-gray-300 shrink-0 mt-0.5 cursor-grab" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-900 truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{item.subtitle}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {item.badge && (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.badge.color}`}>
                            {item.badge.label}
                          </span>
                        )}
                        {item.meta && (
                          <span className="text-[10px] text-gray-400">{item.meta}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {colItems.length === 0 && (
                <div className="text-center py-6 text-[11px] text-gray-400">
                  Boş
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
