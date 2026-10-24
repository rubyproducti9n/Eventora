"use client";

import React, { useState } from "react";
import {
  Building,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  DollarSign,
  Phone,
  User,
} from "lucide-react";
import { VendorChecklistItem, VendorStatus, SupportedCurrency } from "@/types/event";
import { formatCurrency } from "@/lib/utils";
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Modal,
  Progress,
} from "@/components/ui";

interface VendorChecklistManagerProps {
  vendors: VendorChecklistItem[];
  currency?: SupportedCurrency;
  onToggleStatus: (vendorId: string) => void;
  onSaveVendor: (vendor: VendorChecklistItem) => void;
  onDeleteVendor: (vendorId: string) => void;
}

export function VendorChecklistManager({
  vendors,
  currency = "USD",
  onToggleStatus,
  onSaveVendor,
  onDeleteVendor,
}: VendorChecklistManagerProps) {
  // Modal State for Add / Edit Vendor
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<VendorStatus>("needed");
  const [estimatedCost, setEstimatedCost] = useState<number | undefined>(undefined);
  const [contactName, setContactName] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Deletion modal
  const [vendorToDelete, setVendorToDelete] = useState<VendorChecklistItem | null>(null);

  const confirmedCount = vendors.filter((v) => v.status === "confirmed" || v.status === "booked").length;
  const progressPct = vendors.length > 0 ? Math.round((confirmedCount / vendors.length) * 100) : 0;
  const totalEstimatedCosts = vendors.reduce((sum, v) => sum + (v.estimatedCost || 0), 0);

  const openCreateModal = () => {
    setEditingVendorId(null);
    setRole("");
    setStatus("needed");
    setEstimatedCost(undefined);
    setContactName("");
    setPhoneOrEmail("");
    setNotes("");
    setFieldError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vendor: VendorChecklistItem) => {
    setEditingVendorId(vendor.id);
    setRole(vendor.role);
    setStatus(vendor.status);
    setEstimatedCost(vendor.estimatedCost);
    setContactName(vendor.contactName || "");
    setPhoneOrEmail(vendor.phoneOrEmail || "");
    setNotes(vendor.notes || "");
    setFieldError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) {
      setFieldError("Vendor service or role is required");
      return;
    }

    const newVendor: VendorChecklistItem = {
      id: editingVendorId || `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role: role.trim(),
      status,
      estimatedCost: typeof estimatedCost === "number" && !isNaN(estimatedCost) ? Number(estimatedCost) : undefined,
      contactName: contactName.trim() || undefined,
      phoneOrEmail: phoneOrEmail.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSaveVendor(newVendor);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (vendorToDelete) {
      onDeleteVendor(vendorToDelete.id);
      setVendorToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Vendor Overview & Cost Banner */}
      <Card className="border-slate-200">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Vendor Roster & Checklist</CardTitle>
                <p className="text-xs text-slate-500">Track quotes, bookings, and service contacts</p>
              </div>
            </div>
            <Button size="sm" onClick={openCreateModal} className="text-xs gap-1.5 self-start sm:self-auto">
              <Plus className="h-4 w-4" />
              Add Vendor Requirement
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-medium text-slate-500 uppercase">Total Services</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{vendors.length}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-medium text-slate-500 uppercase">Secured / Booked</p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">{confirmedCount}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl col-span-2 sm:col-span-1">
              <p className="text-xs font-medium text-slate-500 uppercase">Total Estimates</p>
              <p className="text-xl font-bold text-indigo-700 mt-0.5">{formatCurrency(totalEstimatedCosts, currency)}</p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between items-center text-xs font-medium text-slate-600">
              <span>Vendor Procurement Progress</span>
              <span>{progressPct}% confirmed</span>
            </div>
            <Progress value={confirmedCount} max={vendors.length || 1} />
          </div>
        </CardContent>
      </Card>

      {/* 2. Vendor List */}
      <Card className="border-slate-200">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-semibold">Service Requirements</CardTitle>
        </CardHeader>

        <CardContent className="p-5 pt-0">
          {vendors.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <Building className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-xs">No vendor requirements added yet.</p>
              <Button size="sm" variant="outline" onClick={openCreateModal} className="text-xs mt-2">
                Add First Vendor
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {vendors.map((v) => {
                const isSecured = v.status === "confirmed" || v.status === "booked";

                return (
                  <div
                    key={v.id}
                    className={`py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-2 rounded-lg transition-colors group ${
                      isSecured ? "bg-slate-50/40" : "hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(v.id)}
                        className={`h-5 w-5 mt-0.5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                          isSecured
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 group-hover:border-indigo-400 bg-white"
                        }`}
                        aria-label={isSecured ? "Mark pending" : "Mark confirmed"}
                      >
                        {isSecured && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              isSecured ? "line-through text-slate-400" : "text-slate-900"
                            }`}
                          >
                            {v.role}
                          </span>
                          <Badge
                            variant={
                              v.status === "confirmed"
                                ? "success"
                                : v.status === "booked"
                                ? "default"
                                : v.status === "contacted"
                                ? "warning"
                                : "outline"
                            }
                            className="text-[10px] capitalize"
                          >
                            {v.status}
                          </Badge>
                        </div>

                        {v.notes && <p className="text-xs text-slate-500">{v.notes}</p>}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-0.5">
                          {v.contactName && (
                            <span className="flex items-center gap-1 text-slate-600">
                              <User className="h-3 w-3" />
                              {v.contactName}
                            </span>
                          )}
                          {v.phoneOrEmail && (
                            <span className="flex items-center gap-1 text-slate-600">
                              <Phone className="h-3 w-3" />
                              {v.phoneOrEmail}
                            </span>
                          )}
                          {typeof v.estimatedCost === "number" && (
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <DollarSign className="h-3 w-3 text-emerald-600" />
                              Estimated: {formatCurrency(v.estimatedCost, currency)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(v)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
                        title="Edit Vendor"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVendorToDelete(v)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                        title="Delete Vendor"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Add / Edit Vendor Requirement */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendorId ? "Edit Vendor Requirement" : "Add Vendor Requirement"}
        description="Configure vendor category, contact information, and estimated quotation."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {fieldError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700">
              {fieldError}
            </div>
          )}

          <Input
            label="Service Role / Category *"
            placeholder="e.g. Wedding Cake Designer, Acoustic Trio, Shuttle Service"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as VendorStatus)}
              options={[
                { value: "needed", label: "Needed / Researching" },
                { value: "contacted", label: "Contacted / In Discussion" },
                { value: "booked", label: "Booked / Contracted" },
                { value: "confirmed", label: "Fully Confirmed" },
              ]}
            />

            <Input
              label="Estimated Cost (Optional)"
              type="number"
              min={0}
              step={10}
              placeholder="e.g. 1200"
              value={estimatedCost ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setEstimatedCost(val === "" ? undefined : parseFloat(val) || 0);
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person Name (Optional)"
              placeholder="e.g. Elena Rostova"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />

            <Input
              label="Contact Phone / Email (Optional)"
              placeholder="e.g. info@artisanbakes.com"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
            />
          </div>

          <Input
            label="Requirements / Notes"
            placeholder="e.g. Needs power outlet by 2pm, dietary labels required"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingVendorId ? "Save Changes" : "Save Vendor"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Deletion */}
      <Modal
        isOpen={!!vendorToDelete}
        onClose={() => setVendorToDelete(null)}
        title="Delete Vendor Requirement"
        description="Are you sure you want to remove this vendor?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Removing <strong>{vendorToDelete?.role}</strong> will delete it from your vendor checklist.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setVendorToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
              Delete Vendor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
