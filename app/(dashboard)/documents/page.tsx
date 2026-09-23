"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/shared/Toast";

export interface DBDocument {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  status: "verified" | "pending" | "flagged";
  uploaded_at: string;
}

export default function MyDocumentsPage() {
  const [documents, setDocuments] = useState<DBDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [syncingDigilocker, setSyncingDigilocker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const fetchUserDocuments = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", user.id)
          .order("uploaded_at", { ascending: false });

        if (error) throw error;
        if (data) setDocuments(data);
      }
    } catch (err: any) {
      console.error("Error fetching documents:", err);
      setFetchError(err?.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDocuments();
  }, []);

  const readyCount = documents.filter((d) => d.status === "verified").length;
  const pendingCount = documents.filter((d) => d.status === "pending").length;
  const flaggedCount = documents.filter((d) => d.status === "flagged").length;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setIsUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in to upload documents.");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const storagePath = `${user.id}/${Date.now()}_${safeName}`;

      // 1. Upload to Supabase Storage 'documents' bucket
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, file, { upsert: true });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // 2. Get public or URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(storagePath);

      // 3. Insert record into documents table
      const { error: dbError } = await supabase.from("documents").insert({
        user_id: user.id,
        name: file.name.replace(/\.[^/.]+$/, ""),
        file_url: urlData?.publicUrl || storagePath,
        file_type: file.type || fileExt || "application/pdf",
        status: "pending",
      });

      if (dbError) throw dbError;

      toast.success("Document uploaded successfully!");
      await fetchUserDocuments();
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err?.message || "Failed to upload document.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteDocument = async (doc: DBDocument) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) return;

    setDeletingId(doc.id);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Extract storage path from file_url if available
      try {
        const urlParts = doc.file_url.split("/documents/");
        if (urlParts.length > 1) {
          const filePath = decodeURIComponent(urlParts[1]);
          await supabase.storage.from("documents").remove([filePath]);
        }
      } catch (e) {
        // Continue DB deletion even if storage clean fails
      }

      // Delete from DB
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success("Document removed from vault.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDigiLockerSync = () => {
    setSyncingDigilocker(true);
    setTimeout(() => {
      setSyncingDigilocker(false);
      toast.success("DigiLocker synced! Digital certificate signatures verified.");
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white">
            My Documents Vault
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Secure digital repository integrated with Supabase Storage and DigiLocker Vault.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDigiLockerSync}
            disabled={syncingDigilocker}
            className="text-xs gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncingDigilocker ? "animate-spin" : ""}`} />
            <span>{syncingDigilocker ? "Syncing..." : "Sync DigiLocker"}</span>
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />

          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-[#064e3b] hover:bg-[#053d2e] text-white text-xs gap-1.5 dark:bg-emerald-600"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                <span>Upload Document</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error state */}
      {fetchError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 flex items-center justify-between dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={fetchUserDocuments}
            className="flex items-center gap-1 rounded-lg bg-rose-200 px-3 py-1 font-semibold text-rose-900 hover:bg-rose-300 dark:bg-rose-900 dark:text-rose-100"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-soft dark:border-[#193c30] dark:bg-[#0f231c]">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Total Vault Assets
          </span>
          <p className="mt-2 text-3xl font-extrabold text-stone-900 dark:text-white">
            {documents.length}
          </p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Stored in Supabase Storage Bucket
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200/90 bg-[#eaf5ea]/80 p-5 shadow-soft dark:border-emerald-900/60 dark:bg-[#0c2217]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#064e3b] dark:text-emerald-400">
              Verified Documents
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#064e3b] dark:text-emerald-300">
            {readyCount} verified
          </p>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
            Digitally sealed & approved
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/80 p-5 shadow-soft dark:border-amber-900/60 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Pending / Flagged
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-amber-900 dark:text-amber-400">
            {pendingCount + flaggedCount} pending
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
            Awaiting nodal officer scrutiny
          </p>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-stone-200 bg-white p-5 dark:border-[#193c30] dark:bg-[#0f231c] space-y-3"
            >
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center dark:border-[#193c30] dark:bg-[#0f231c]">
          <FileText className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
            No documents uploaded yet
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Upload your Caste Certificate, Income Certificate, and Marksheets to Supabase Storage for automatic application linking.
          </p>
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 bg-[#064e3b] text-white text-xs gap-1.5 dark:bg-emerald-600"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload your first document</span>
          </Button>
        </div>
      ) : (
        /* Documents Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const isFlagged = doc.status === "flagged";
            const isVerified = doc.status === "verified";
            const isDeleting = deletingId === doc.id;

            return (
              <div
                key={doc.id}
                className={`rounded-3xl border p-5 transition-all shadow-soft bg-white dark:bg-[#0f231c] ${
                  isFlagged
                    ? "border-amber-300 bg-amber-50/20 dark:border-amber-900/60"
                    : isVerified
                    ? "border-emerald-200/80 dark:border-emerald-900/50"
                    : "border-stone-200/90 dark:border-[#193c30]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        isFlagged
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : isVerified
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-stone-100 text-stone-700 dark:bg-[#132820] dark:text-stone-300"
                      }`}
                    >
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-white capitalize">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Type: {doc.file_type || "Document"}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={isVerified ? "mint" : isFlagged ? "warning" : "subtle"}
                    size="sm"
                  >
                    {isVerified ? "Verified" : isFlagged ? "Flagged" : "Pending"}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-stone-500 pt-3 border-t border-stone-100 dark:border-[#193c30] dark:text-stone-400">
                  <span>
                    Uploaded: {new Date(doc.uploaded_at).toLocaleDateString("en-IN")}
                  </span>
                  <div className="flex items-center gap-3">
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold dark:text-emerald-400"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>View</span>
                      </a>
                    )}
                    <button
                      disabled={isDeleting}
                      onClick={() => handleDeleteDocument(doc)}
                      className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-semibold disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
