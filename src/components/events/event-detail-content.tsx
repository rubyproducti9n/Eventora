"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Calendar, MapPin, Users, DollarSign, 
  Clock, Building, ListOrdered, CheckCircle2, Edit3, Trash2, Plus, AlertTriangle, Sparkles, Lightbulb
} from "lucide-react";
import { useEvents } from "@/lib/hooks/use-events";
import { formatDate, formatCurrency } from "@/lib/utils";
import { 
  Button, Card, CardHeader, CardTitle, CardContent, 
  Badge, EmptyState, Progress, Modal, Input 
} from "@/components/ui";
import { BudgetManager } from "@/components/budget/budget-manager";
import { TimelineManager } from "@/components/timeline/timeline-manager";
import { VendorChecklistManager } from "@/components/vendors/vendor-checklist-manager";
import { trackAppEvent } from "@/lib/firebase";

export function EventDetailContent() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const { 
    events, isLoading, toggleTask, addTask, updateTask, deleteTask, 
    deleteEvent, saveEvent, saveBudgetItem, deleteBudgetItem, saveVendor, deleteVendor 
  } = useEvents();

  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "budget" | "vendors">("overview");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genNotice, setGenNotice] = useState<string | null>(null);

  // New task form modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskTimeframe, setTaskTimeframe] = useState("1 Week Before");

  const event = events.find((e) => e.id === eventId);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded-md" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 rounded-xl md:col-span-2" />
          <div className="h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <Link href="/events">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>
        <EmptyState
          title="Event Not Found"
          description="The event you are looking for does not exist or may have been deleted."
          action={
            <Link href="/events">
              <Button>Browse All Events</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleDeleteEvent = async () => {
    setIsDeleting(true);
    try {
      deleteEvent(event.id);
      setIsDeleteModalOpen(false);
      router.push("/events");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask(event.id, {
      title: taskTitle.trim(),
      description: taskDescription.trim() || "User defined preparation task",
      timeframe: taskTimeframe.trim() || "General",
      isCompleted: false,
      category: "preparation",
    });

    setTaskTitle("");
    setTaskDescription("");
    setIsTaskModalOpen(false);
  };

  const handleGeneratePlan = async () => {
    if (!event) return;
    setIsGenerating(true);
    setGenNotice(null);

    try {
      const res = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event }),
      });

      if (!res.ok) {
        throw new Error("Plan generation failed on the server.");
      }

      const data = await res.json();
      if (data?.plan) {
        saveEvent({
          ...event,
          plan: data.plan,
        });
        trackAppEvent("generate_plan", { mode: data.mode });
        if (data.mode === "demo_mode") {
          setGenNotice(data.notice || "Generated in Demo Mode (simulated plan).");
        }
      }
    } catch (err: unknown) {
      console.error(err);
      setGenNotice("Unable to complete generation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const plan = event?.plan;
  const milestones = plan?.timeline || [];
  const completedMilestones = milestones.filter((m) => m.isCompleted).length;
  const totalMilestones = milestones.length;

  return (
    <div className="space-y-8">
      {/* Navigation & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link href="/events">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="accent"
            onClick={handleGeneratePlan}
            isLoading={isGenerating}
            disabled={isGenerating}
            className="text-xs gap-1.5 shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {plan ? "Regenerate AI Plan" : "Generate AI Plan"}
          </Button>
          <Link href={`/events/${event.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Edit3 className="h-3.5 w-3.5" />
              Edit Event
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
          <Badge variant={event.status === "planning" ? "default" : "outline"} className="capitalize">
            {event.status}
          </Badge>
        </div>
      </div>

      {/* Notice Banner for Demo Mode / Information */}
      {genNotice && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          {genNotice}
        </div>
      )}

      {plan?.generationMode === "demo_mode" && (
        <div className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <span className="font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px] uppercase">
              Demo Mode
            </span>
            <span>
              This event plan was created using deterministic rule-based algorithms. Configure a Google Gemini API key to activate live generative AI planning.
            </span>
          </div>
        </div>
      )}

      {plan?.generationMode === "live_ai" && (
        <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800">
          <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>
            Personalized event plan generated live by Google Gemini AI.
          </span>
        </div>
      )}

      {/* View Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === "overview"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Plan Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("timeline")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "timeline"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Clock className="h-4 w-4" />
          Timeline & Milestones
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("budget")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "budget"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Budget Manager
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("vendors")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "vendors"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building className="h-4 w-4" />
          Vendor Checklist
        </button>
      </div>

      {activeTab === "budget" ? (
        <BudgetManager
          event={event}
          onSaveItem={(item) => saveBudgetItem(event.id, item)}
          onDeleteItem={(itemId) => deleteBudgetItem(event.id, itemId)}
        />
      ) : activeTab === "timeline" ? (
        <TimelineManager
          eventId={event.id}
          eventDate={event.date}
          milestones={milestones}
          onToggleTask={(taskId) => toggleTask(event.id, taskId, "milestone")}
          onAddTask={(task) => addTask(event.id, task)}
          onUpdateTask={(task) => updateTask(event.id, task)}
          onDeleteTask={(taskId) => deleteTask(event.id, taskId)}
        />
      ) : activeTab === "vendors" ? (
        <VendorChecklistManager
          vendors={plan?.vendorChecklist || []}
          currency={event.currency}
          onToggleStatus={(vendorId) => toggleTask(event.id, vendorId, "vendor")}
          onSaveVendor={(vendor) => saveVendor(event.id, vendor)}
          onDeleteVendor={(vendorId) => deleteVendor(event.id, vendorId)}
        />
      ) : (
        <>
          {/* Main Event Overview Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {event.eventType}
              </Badge>
              {plan?.theme && (
                <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  Theme: {plan.theme}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {event.title}
            </h1>

            {plan?.summary ? (
              <p className="text-sm text-slate-600 leading-relaxed">{plan.summary}</p>
            ) : (
              <p className="text-sm text-slate-400 italic">No plan summary generated yet.</p>
            )}

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-600 pt-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-indigo-500" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-indigo-500" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-500" />
                <span>{event.guestCount} Guests</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span>Budget: {formatCurrency(event.targetBudget, event.currency)}</span>
              </div>
            </div>
          </div>

          {totalMilestones > 0 ? (
            <div className="lg:w-72 bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 shrink-0">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span>Planning Progress</span>
                <span>{Math.round((completedMilestones / totalMilestones) * 100)}%</span>
              </div>
              <Progress value={completedMilestones} max={totalMilestones} />
              <p className="text-[11px] text-slate-500 text-right">
                {completedMilestones} of {totalMilestones} milestones completed
              </p>
            </div>
          ) : (
            <div className="lg:w-72 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-3 shrink-0 text-center">
              <Sparkles className="h-6 w-6 text-indigo-500 mx-auto" />
              <p className="text-xs font-semibold text-indigo-900">Ready for Planning</p>
              <p className="text-[11px] text-slate-500">Generate an AI timeline, tailored budget breakdown, and vendor checklist.</p>
              <Button
                size="sm"
                variant="accent"
                onClick={handleGeneratePlan}
                isLoading={isGenerating}
                disabled={isGenerating}
                className="w-full text-xs"
              >
                Generate Plan Now
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Recommendations Banner if present */}
      {plan?.recommendations && plan.recommendations.length > 0 && (
        <Card className="border-indigo-100 bg-indigo-50/40">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center gap-2 text-indigo-900">
              <Lightbulb className="h-4 w-4 text-indigo-600" />
              <CardTitle className="text-sm font-bold">Personalized Strategic Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-700">
              {plan.recommendations.map((rec, idx) => (
                <li key={idx} className="leading-relaxed">
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Planning Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Milestones */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-base sm:text-lg">Preparation Timeline</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsTaskModalOpen(true)}
                  className="text-xs h-7 gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Task
                </Button>
                {totalMilestones > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {completedMilestones}/{totalMilestones} Done
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0">
              {milestones.length === 0 ? (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Clock className="h-8 w-8 mx-auto text-slate-300" />
                  <p className="text-xs">No tasks added yet. Add a custom task or generate a full AI plan.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      className="py-3 flex items-start justify-between gap-3 group select-none hover:bg-slate-50/70 p-2 rounded-lg transition-colors"
                    >
                      <div
                        onClick={() => toggleTask(event.id, m.id, "milestone")}
                        className="flex items-start gap-3 flex-1 cursor-pointer"
                      >
                        <button
                          type="button"
                          className={`h-5 w-5 mt-0.5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            m.isCompleted
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-slate-300 group-hover:border-indigo-400 bg-white"
                          }`}
                          aria-label={m.isCompleted ? "Mark incomplete" : "Mark complete"}
                        >
                          {m.isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>

                        <div className="space-y-0.5">
                          <span
                            className={`text-sm font-medium ${
                              m.isCompleted ? "line-through text-slate-400" : "text-slate-800"
                            }`}
                          >
                            {m.title}
                          </span>
                          <p className={`text-xs ${m.isCompleted ? "line-through text-slate-300" : "text-slate-500"}`}>
                            {m.description}
                          </p>
                          <span className="inline-block text-[10px] font-semibold tracking-wide uppercase text-indigo-600/80 mt-1">
                            {m.timeframe}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(event.id, m.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 h-7 w-7 transition-opacity"
                        title="Delete milestone"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Breakdown */}
          {plan?.budgetBreakdown && plan.budgetBreakdown.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-base sm:text-lg">Budget Allocations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="divide-y divide-slate-100">
                  {plan.budgetBreakdown.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                      <div>
                        <p className="font-medium text-slate-800">{item.category}</p>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(item.allocatedAmount, event.currency)}
                        </p>
                        {item.actualAmount && (
                          <p className="text-[11px] text-slate-400">
                            Actual: {formatCurrency(item.actualAmount, event.currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Vendors and Schedules */}
        <div className="space-y-6">
          {plan?.vendorChecklist && plan.vendorChecklist.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-base font-semibold">Vendor Roster</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="divide-y divide-slate-100">
                  {plan.vendorChecklist.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => toggleTask(event.id, v.id, "vendor")}
                      className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors"
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-800">{v.role}</p>
                        {v.contactName && <p className="text-xs text-slate-500">{v.contactName}</p>}
                      </div>
                      <Badge
                        variant={v.status === "confirmed" ? "success" : "secondary"}
                        className="text-[10px] capitalize"
                      >
                        {v.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {plan?.suggestedSchedule && plan.suggestedSchedule.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <ListOrdered className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-base font-semibold">Day-Of Run Sheet</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-2.5">
                  {plan.suggestedSchedule.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">
                        {item.time}
                      </span>
                      <span className="text-slate-700 mt-0.5">{item.activity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Event Deletion"
        description="Are you sure you want to delete this event?"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">{event.title}</p>
              <p className="mt-0.5">
                This will delete the event and its associated milestones, budget allocations, and vendor records.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteEvent}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Delete Event
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Preparation Milestone"
        description="Add a new milestone or action item for this event."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Milestone Title *"
            placeholder="e.g. Schedule final cake tasting"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Timeframe / Due Window"
            placeholder="e.g. 2 Weeks Before, Day Before"
            value={taskTimeframe}
            onChange={(e) => setTaskTimeframe(e.target.value)}
          />

          <Input
            label="Description / Notes"
            placeholder="Details or vendor contact notes"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Milestone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
