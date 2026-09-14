import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  Filter,
  Cloud,
  HardDrive,
  RefreshCw,
  Plus,
  X,
  File,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../api/client';
import { DocumentItem, DocumentType, Shipment } from '../types';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const DocumentsPage: React.FC = () => {
  const { hasRole } = useAuth();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [storageProvider, setStorageProvider] = useState<string>('local');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('BILL_OF_LADING');
  const [shipmentId, setShipmentId] = useState('');
  const [availableShipments, setAvailableShipments] = useState<Shipment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Delete modal state
  const [deletingDoc, setDeletingDoc] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getDocuments({
        search: search.trim(),
        documentType: typeFilter,
      });
      setDocuments(data.documents);
      setTotalCount(data.total);
      setStorageProvider(data.storageProvider);
    } catch (err: any) {
      setError(err?.message || 'Failed to retrieve storage documents.');
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Pre-load shipments for upload selector
  useEffect(() => {
    if (isUploadOpen) {
      api.getShipments({ size: 50 }).then(res => setAvailableShipments(res.content)).catch(() => {});
    }
  }, [isUploadOpen]);

  const handleDownload = async (doc: DocumentItem) => {
    try {
      await api.downloadDocument(doc.id, doc.fileName);
    } catch (err: any) {
      alert(err?.message || 'Failed to download file.');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploadError(null);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim() || file.name);
      formData.append('documentType', documentType);
      if (shipmentId) formData.append('shipmentId', shipmentId);

      await api.uploadDocument(formData);
      setIsUploadOpen(false);
      setFile(null);
      setTitle('');
      setShipmentId('');
      loadDocuments();
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDoc) return;
    setIsDeleting(true);
    try {
      await api.deleteDocument(deletingDoc.id);
      setDeletingDoc(null);
      loadDocuments();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete file.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">
              Cloud Storage Document Vault
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
              {storageProvider === 'gcs' ? <Cloud className="w-3.5 h-3.5" /> : <HardDrive className="w-3.5 h-3.5" />}
              <span>{storageProvider === 'gcs' ? 'Google Cloud Storage' : 'Cloud Local Disk'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sealed bills of lading, customs declarations, and commercial invoices
          </p>
        </div>

        {hasRole('ADMIN', 'OPERATIONS_MANAGER') && (
          <button
            id="documents-upload-btn"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="documents-search-input"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search document title, filename, or shipment ID..."
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            id="documents-type-filter"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full md:w-48 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-3 py-2"
          >
            <option value="ALL">All Document Types</option>
            <option value="BILL_OF_LADING">Bill of Lading</option>
            <option value="INVOICE">Commercial Invoice</option>
            <option value="CUSTOMS_DECLARATION">Customs Declaration</option>
            <option value="DELIVERY_RECEIPT">Proof of Delivery</option>
            <option value="CERTIFICATE">Certificate</option>
          </select>

          <button
            onClick={loadDocuments}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors shrink-0"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-rose-600 text-xs">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            {error}
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <span>Scanning storage bucket records...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No Documents Found</h3>
            <p className="text-xs text-slate-500 mt-1">Upload a bill of lading or shipment invoice to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Document Title & File</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Linked Consignment</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{doc.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{doc.fileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {doc.documentType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-600 font-semibold">
                      {doc.shipmentId || <span className="text-slate-400 font-normal">Global Asset</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {doc.uploadedByName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          id={`download-doc-${doc.id}`}
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Download document from cloud storage"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {hasRole('ADMIN') && (
                          <button
                            id={`delete-doc-${doc.id}`}
                            onClick={() => setDeletingDoc(doc)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete file permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Upload Document to Cloud Storage</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {uploadError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {uploadError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="doc-upload-title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Master Bill of Lading"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Classification Type
                </label>
                <select
                  id="doc-upload-type"
                  value={documentType}
                  onChange={e => setDocumentType(e.target.value as DocumentType)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
                >
                  <option value="BILL_OF_LADING">Bill of Lading</option>
                  <option value="INVOICE">Commercial Invoice</option>
                  <option value="CUSTOMS_DECLARATION">Customs Declaration</option>
                  <option value="DELIVERY_RECEIPT">Proof of Delivery (POD)</option>
                  <option value="CERTIFICATE">Inspection Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Link to Shipment (Optional)
                </label>
                <select
                  id="doc-upload-shipment"
                  value={shipmentId}
                  onChange={e => setShipmentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
                >
                  <option value="">-- No specific shipment (Global file) --</option>
                  {availableShipments.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.id} - {s.customerName} ({s.origin.split(',')[0]} → {s.destination.split(',')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  File Asset <span className="text-rose-500">*</span>
                </label>
                <input
                  id="doc-upload-file"
                  type="file"
                  required
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                      if (!title) setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  id="doc-upload-submit-btn"
                  type="submit"
                  disabled={isUploading || !file}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {isUploading ? 'Uploading to GCS...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingDoc}
        title="Confirm Document Removal"
        message={`Are you sure you want to permanently delete "${deletingDoc?.title}" (${deletingDoc?.fileName}) from the storage bucket?`}
        confirmLabel="Delete File"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingDoc(null)}
      />
    </div>
  );
};
