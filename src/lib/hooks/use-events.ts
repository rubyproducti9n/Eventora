"use client";

import { useSyncExternalStore, useCallback, useEffect } from "react";
import { EventDetails, TimelineMilestone, BudgetItem, VendorChecklistItem } from "@/types/event";
import { eventRepository } from "@/lib/storage/event-storage";
import { initAnalytics, trackAppEvent } from "@/lib/firebase";

function subscribe(callback: () => void) {
  window.addEventListener("eventora_storage_updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("eventora_storage_updated", callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedEvents: EventDetails[] = [];
let cachedString = "";

function getSnapshot(): EventDetails[] {
  if (typeof window === "undefined") return [];
  const current = eventRepository.getAll();
  const currentStr = JSON.stringify(current);
  if (currentStr !== cachedString) {
    cachedString = currentStr;
    cachedEvents = current;
  }
  return cachedEvents;
}

const EMPTY_EVENTS: EventDetails[] = [];

function getServerSnapshot(): EventDetails[] {
  return EMPTY_EVENTS;
}

export function useEvents() {
  const events = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Initialize Firebase RTDB synchronization and Analytics on client mount
  useEffect(() => {
    eventRepository.initSync();
    initAnalytics();
  }, []);

  const handleSave = useCallback((event: EventDetails): boolean => {
    trackAppEvent("create_event", { eventType: event.eventType });
    return eventRepository.save(event);
  }, []);

  const handleDelete = useCallback((id: string): boolean => {
    return eventRepository.delete(id);
  }, []);

  const handleToggleTask = useCallback((eventId: string, taskId: string, type: "milestone" | "vendor"): boolean => {
    trackAppEvent(type === "milestone" ? "complete_task" : "confirm_vendor");
    return eventRepository.toggleTask(eventId, taskId, type);
  }, []);

  const handleAddTask = useCallback((eventId: string, task: Omit<TimelineMilestone, "id">): boolean => {
    return eventRepository.addTask(eventId, task);
  }, []);

  const handleUpdateTask = useCallback((eventId: string, task: TimelineMilestone): boolean => {
    return eventRepository.updateTask(eventId, task);
  }, []);

  const handleDeleteTask = useCallback((eventId: string, taskId: string): boolean => {
    return eventRepository.deleteTask(eventId, taskId);
  }, []);

  const handleSaveBudgetItem = useCallback((eventId: string, item: BudgetItem): boolean => {
    trackAppEvent("update_budget");
    return eventRepository.saveBudgetItem(eventId, item);
  }, []);

  const handleDeleteBudgetItem = useCallback((eventId: string, itemId: string): boolean => {
    return eventRepository.deleteBudgetItem(eventId, itemId);
  }, []);

  const handleSaveVendor = useCallback((eventId: string, vendor: VendorChecklistItem): boolean => {
    trackAppEvent("confirm_vendor");
    return eventRepository.saveVendor(eventId, vendor);
  }, []);

  const handleDeleteVendor = useCallback((eventId: string, vendorId: string): boolean => {
    return eventRepository.deleteVendor(eventId, vendorId);
  }, []);

  const handleClear = useCallback((): boolean => {
    return eventRepository.clear();
  }, []);

  const handleReset = useCallback((): boolean => {
    return eventRepository.resetSamples();
  }, []);

  return {
    events,
    isLoading: false,
    error: null,
    refreshEvents: () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("eventora_storage_updated"));
      }
    },
    saveEvent: handleSave,
    deleteEvent: handleDelete,
    toggleTask: handleToggleTask,
    addTask: handleAddTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    saveBudgetItem: handleSaveBudgetItem,
    deleteBudgetItem: handleDeleteBudgetItem,
    saveVendor: handleSaveVendor,
    deleteVendor: handleDeleteVendor,
    clearAllEvents: handleClear,
    resetSampleEvents: handleReset,
  };
}
