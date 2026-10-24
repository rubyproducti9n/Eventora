"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
} from "lucide-react";
import { EventDetails, BudgetItem } from "@/types/event";
import { calculateBudgetSummary } from "@/lib/budget/budget-calculations";
import { formatCurrency } from "@/lib/utils";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Modal,
  Progress,
} from "@/components/ui";

interface BudgetManagerProps {
  event: EventDetails;
  onSaveItem: (item: BudgetItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export function BudgetManager({ event, onSaveItem, onDeleteItem }: BudgetManagerProps) {
  const items = event.plan?.budgetBreakdown || [];
  const calculations = calculateBudgetSummary(event.targetBudget, items);

  // Modal State for Adding / Editing Category
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [allocatedAmount, setAllocatedAmount] = useState<number>(0);
  const [actualAmount, setActualAmount] = useState<number | undefined>(undefined);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // State for deletion confirmation
  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null);

  const openCreateModal = () => {
    setEditingItemId(null);
    setCategoryName("");
    setDescription("");
    setAllocatedAmount(0);
    setActualAmount(undefined);
    setIsPaid(false);
    setFieldError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: BudgetItem) => {
    setEditingItemId(item.id);
    setCategoryName(item.category);
    setDescription(item.description);
    setAllocatedAmount(item.allocatedAmount);
    setActualAmount(item.actualAmount);
    setIsPaid(!!item.isPaid);
    setFieldError(null);
    setIsModalOpen(true);
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setFieldError("Category name is required");
      return;
    }
    if (allocatedAmount < 0 || isNaN(allocatedAmount)) {
      setFieldError("Allocated amount must be a positive number");
      return;
    }

    const newItem: BudgetItem = {
      id: editingItemId || `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: categoryName.trim(),
      description: description.trim() || "Planned expense category",
      allocatedAmount: Number(allocatedAmount),
      actualAmount: typeof actualAmount === "number" && !isNaN(actualAmount) ? Number(actualAmount) : undefined,
      isPaid,
    };

    onSaveItem(newItem);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDeleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. High-Level Financial Metrics Card */}
      <Card className="border-slate-200">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Budget Breakdown & Allocation</CardTitle>
                <p className="text-xs text-slate-500">Deterministic calculation of spending vs target budget</p>
              </div>
            </div>
            <Button size="sm" onClick={openCreateModal} className="text-xs gap-1.5 self-start sm:self-auto">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-6">
          {/* Over-Budget Alert Warning */}
          {calculations.isOverBudget && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Target Budget Exceeded</p>
                <p className="mt-0.5 leading-relaxed">
                  Total planned allocations exceed the target budget by{" "}
                  <strong>{formatCurrency(calculations.overageAmount, event.currency)}</strong>. Consider adjusting individual category amounts to stay within your spending limit.
                </p>
              </div>
            </div>
          )}

          {/* Metric Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-medium text-slate-500 uppercase">Target Budget</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {formatCurrency(calculations.targetBudget, event.currency)}
              </p>
              <p className="text-[11px] text-slate-400">Total planned cap</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-medium text-slate-500 uppercase">Allocated Budget</p>
              <p className="text-xl font-extrabold text-indigo-700 mt-0.5">
                {formatCurrency(calculations.totalAllocated, event.currency)}
              </p>
              <p className="text-[11px] text-slate-400">{items.length} active categories</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-medium text-slate-500 uppercase">Remaining Planned</p>
              <p
                className={`text-xl font-extrabold mt-0.5 ${
                  calculations.remainingPlanned < 0 ? "text-rose-600" : "text-emerald-700"
                }`}
              >
                {formatCurrency(calculations.remainingPlanned, event.currency)}
              </p>
              <p className="text-[11px] text-slate-400">
                {calculations.remainingPlanned < 0 ? "Deficit" : "Available to allocate"}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-medium text-slate-500 uppercase">Actual Spent</p>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                {formatCurrency(calculations.totalActual, event.currency)}
              </p>
              <p className="text-[11px] text-slate-400">Confirmed expenditures</p>
            </div>
          </div>

          {/* Utilization Progress Bar */}
          {calculations.utilizationPercentage !== null && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                <span>Budget Utilization</span>
                <span className={calculations.isOverBudget ? "text-rose-600 font-bold" : ""}>
                  {calculations.utilizationPercentage}% allocated
                </span>
              </div>
              <Progress
                value={Math.min(calculations.utilizationPercentage, 100)}
                max={100}
                colorClass={calculations.isOverBudget ? "bg-rose-600" : "bg-emerald-600"}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Interactive Category Roster */}
      <Card className="border-slate-200">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-semibold">Allocated Expense Categories</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {items.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <DollarSign className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-xs">No budget categories allocated yet.</p>
              <Button size="sm" variant="outline" onClick={openCreateModal} className="text-xs mt-2">
                Add First Category
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const categoryRemaining =
                  typeof item.actualAmount === "number" ? item.allocatedAmount - item.actualAmount : null;

                return (
                  <div
                    key={item.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-lg transition-colors group"
                  >
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{item.category}</span>
                        {item.isPaid ? (
                          <Badge variant="success" className="text-[10px] px-1.5 py-0">
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-slate-500">
                            Planned
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {formatCurrency(item.allocatedAmount, event.currency)}
                        </p>
                        {typeof item.actualAmount === "number" && (
                          <p className="text-[11px] text-slate-400">
                            Actual: {formatCurrency(item.actualAmount, event.currency)}
                            {categoryRemaining !== null && (
                              <span
                                className={`ml-1 font-medium ${
                                  categoryRemaining < 0 ? "text-rose-600" : "text-emerald-600"
                                }`}
                              >
                                ({categoryRemaining < 0 ? "-" : "+"}
                                {formatCurrency(Math.abs(categoryRemaining), event.currency)})
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
                          title="Edit Category"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setItemToDelete(item)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Add / Edit Budget Category */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItemId ? "Edit Budget Category" : "Add Budget Category"}
        description="Set the category title, planned allocation, and optional actual expense."
      >
        <form onSubmit={handleSubmitItem} className="space-y-4">
          {fieldError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700">
              {fieldError}
            </div>
          )}

          <Input
            label="Category Name *"
            placeholder="e.g. Venue & Rentals, Catering, Live Band"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Description / Scope"
            placeholder="e.g. 5-course dinner and beverages"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Planned Amount *"
              type="number"
              min={0}
              step={10}
              placeholder="1000"
              value={allocatedAmount}
              onChange={(e) => setAllocatedAmount(parseFloat(e.target.value) || 0)}
              required
            />

            <Input
              label="Actual Spent (Optional)"
              type="number"
              min={0}
              step={10}
              placeholder="Leave blank if unconfirmed"
              value={actualAmount ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setActualAmount(val === "" ? undefined : parseFloat(val) || 0);
              }}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPaidCheckbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isPaidCheckbox" className="text-xs text-slate-700 font-medium select-none cursor-pointer">
              Mark this expense as fully paid
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingItemId ? "Save Changes" : "Add Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Category Deletion */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Delete Budget Category"
        description="Are you sure you want to remove this category allocation?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Removing <strong>{itemToDelete?.category}</strong> will subtract{" "}
            <strong>{formatCurrency(itemToDelete?.allocatedAmount || 0, event.currency)}</strong> from your planned
            allocations.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setItemToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
              Remove Category
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
