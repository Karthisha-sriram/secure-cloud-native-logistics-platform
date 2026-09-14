import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  Calendar,
  User,
  Scale,
  Box,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Check,
  PlusCircle,
  X,
  Building,
} from 'lucide-react';
import { api } from '../api/client';
import { Shipment, ShipmentStatus, DocumentType } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';

const PROGRESSION_STAGES: ShipmentStatus[] = [
  'CREATED',
  'PICKED_UP',
  'IN_TRANSIT',
  'ARRIVED_AT_FACILITY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const ShipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<ShipmentStatus>('IN_TRANSIT');
  const [statusLocation, setStatusLocation] = useState('');
  const [statusDescription, setStatusDescription] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Document upload modal state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<DocumentType>('BILL_OF_LADING');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const fetchShipment = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getShipmentById(id);
      setShipment(data);
      setStatusLocation(data.destination.split(',')[0] + ' Hub');
    } catch (err: any) {
      setError(err?.message || 'Failed to retrieve shipment details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !shipment) return;
    setStatusError(null);

    if (!statusLocation.trim()) {
      setStatusError('Location checkpoint is required.');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await api.updateShipmentStatus(id, {
        status: nextStatus,
        location: statusLocation.trim(),
        description: statusDescription.trim() || `Shipment advanced to ${nextStatus.replace('_', ' ')}`,
      });
      setShipment(res.shipment);
      setIsStatusModalOpen(false);
      setStatusDescription('');
    } catch (err: any) {
      setStatusError(err?.message || 'Failed to update consignment status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedFile) return;
    setDocError(null);

    setIsUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', docTitle.trim() || selectedFile.name);
      formData.append('documentType', docType);
      formData.append('shipmentId', id);
      if (shipment?.customerId) {
        formData.append('customerId', shipment.customerId);
      }

      await api.uploadDocument(formData);
      setIsDocModalOpen(false);
      setSelectedFile(null);
      setDocTitle('');
      fetchShipment();
    } catch (err: any) {
      setDocError(err?.message || 'Failed to upload document to storage.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDownloadDoc = async (docId: string, fileName: string) => {
    try {
      await api.downloadDocument(docId, fileName);
    } catch (err: any) {
      alert(err?.message || 'Download failed.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-slate-500 text-xs">
        <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
        <span>Loading consignment manifest & tracking history...</span>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-xl text-center max-w-lg mx-auto">
        <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-rose-900">Shipment Unavailable</h3>
        <p className="text-xs text-rose-700 mt-1">{error || 'Record does not exist or unauthorized.'}</p>
        <button
          onClick={() => navigate('/shipments')}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors"
        >
          Return to Shipments
        </button>
      </div>
    );
  }

  // Calculate timeline index
  const currentStageIndex = PROGRESSION_STAGES.indexOf(shipment.currentStatus);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            id="shipment-detail-back-btn"
            onClick={() => navigate('/shipments')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Back to all shipments"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold font-mono text-slate-900">
                {shipment.id}
              </h1>
              <StatusBadge status={shipment.currentStatus} size="sm" />
              <PriorityBadge priority={shipment.priority} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <span className="font-medium text-slate-700">{shipment.customerName}</span> • Created {new Date(shipment.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasRole('ADMIN', 'OPERATIONS_MANAGER') && (
            <button
              id="shipment-update-status-btn"
              onClick={() => {
                setNextStatus(shipment.currentStatus === 'DELIVERED' ? 'DELIVERED' : 'IN_TRANSIT');
                setIsStatusModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Update Status</span>
            </button>
          )}

          {hasRole('ADMIN', 'OPERATIONS_MANAGER') && (
            <button
              id="shipment-edit-btn"
              onClick={() => navigate(`/shipments/${shipment.id}/edit`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit</span>
            </button>
          )}

          <button
            id="shipment-refresh-btn"
            onClick={fetchShipment}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Refresh Consignment"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Shipment Timeline Tracker */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Consignment Journey Tracker</h2>
          <span className="text-xs text-slate-500 font-mono">
            ETA: <strong className="text-slate-800">{shipment.expectedDeliveryDate}</strong>
          </span>
        </div>

        {shipment.currentStatus === 'DELAYED' ? (
          <div className="p-4 mb-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold">Consignment Currently Flagged as Delayed</p>
              <p className="text-rose-600 text-[11px] mt-0.5">
                Check audit history below for latest terminal incident report or carrier inspection log.
              </p>
            </div>
          </div>
        ) : null}

        <div className="relative pt-2 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PROGRESSION_STAGES.map((stage, idx) => {
              const isPast = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx && shipment.currentStatus !== 'DELAYED';
              const isDelayed = shipment.currentStatus === 'DELAYED' && idx === 2;

              let circleClass = 'bg-slate-100 text-slate-400 border-slate-200';
              let titleClass = 'text-slate-400';

              if (isPast) {
                circleClass = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
                titleClass = 'text-slate-800 font-semibold';
              } else if (isCurrent) {
                circleClass = 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 shadow-md animate-pulse';
                titleClass = 'text-blue-700 font-bold';
              }

              return (
                <div key={stage} className="flex flex-col items-center text-center relative">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all ${circleClass}`}>
                    {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className={`mt-2 text-xs capitalize ${titleClass}`}>
                    {stage.toLowerCase().replace(/_/g, ' ')}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {isPast ? 'Completed' : isCurrent ? 'Active Stage' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details Grid: Route & Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Route Details */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Route Waypoints</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">Origin</span>
              <p className="text-slate-900 font-medium mt-0.5">{shipment.origin}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">Destination</span>
              <p className="text-slate-900 font-medium mt-0.5">{shipment.destination}</p>
            </div>
          </div>
        </div>

        {/* Cargo Specs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Box className="w-4 h-4 text-blue-600" />
            <span>Cargo & Freight Specs</span>
          </h2>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 text-[11px]">Description</span>
              <p className="font-medium text-slate-900">{shipment.packageDescription}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 text-[11px]">Weight</span>
                <p className="font-semibold text-slate-900">{shipment.weightKg} kg</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Dimensions</span>
                <p className="font-semibold text-slate-900">{shipment.dimensions || 'Standard Container'}</p>
              </div>
            </div>
            {shipment.additionalNotes && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 text-[11px]">Handling Notes</span>
                <p className="text-slate-700 bg-amber-50/60 p-2 rounded border border-amber-100 mt-1">
                  {shipment.additionalNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Recipient Contact</span>
          </h2>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 text-[11px]">Contact Person</span>
              <p className="font-medium text-slate-900">{shipment.contactName || 'Unassigned'}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Phone</span>
              <p className="font-medium text-slate-900">{shipment.contactPhone || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Corporate Email</span>
              <p className="font-medium text-slate-900">{shipment.contactEmail || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Attached Documents & Event Audit History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attached Documents Vault */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">Consignment Documents</h2>
              </div>
              <button
                id="shipment-upload-doc-modal-btn"
                onClick={() => setIsDocModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>

            {(!shipment.documents || shipment.documents.length === 0) ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No documents uploaded yet for this consignment.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {shipment.documents.map(doc => (
                  <div
                    key={doc.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded bg-blue-50 text-blue-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{doc.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {doc.documentType.replace(/_/g, ' ')} • {(doc.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadDoc(doc.id, doc.fileName)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                      title="Download document file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Audit Event History */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900">Chain of Custody & Event Log</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {shipment.events?.length || 0} events recorded
            </span>
          </div>

          {(!shipment.events || shipment.events.length === 0) ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No tracking events logged.
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {shipment.events.map(ev => (
                <div key={ev.id} className="relative group">
                  <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white border-2 border-white" />
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900">{ev.location}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ev.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="mt-1">
                      <StatusBadge status={ev.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{ev.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Logged by: {ev.performedByName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Update Shipment Status</h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              {statusError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {statusError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  New Status
                </label>
                <select
                  id="update-status-select"
                  value={nextStatus}
                  onChange={e => setNextStatus(e.target.value as ShipmentStatus)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
                >
                  <option value="PICKED_UP">Picked Up</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="ARRIVED_AT_FACILITY">Arrived at Facility</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Location Checkpoint <span className="text-rose-500">*</span>
                </label>
                <input
                  id="update-status-location-input"
                  type="text"
                  value={statusLocation}
                  onChange={e => setStatusLocation(e.target.value)}
                  placeholder="e.g. Memphis Distribution Hub 3"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Event Notes / Driver Dispatch Notes
                </label>
                <textarea
                  id="update-status-notes-input"
                  rows={2}
                  value={statusDescription}
                  onChange={e => setStatusDescription(e.target.value)}
                  placeholder="Provide details about handover, customs stamp, or reason for delay..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  id="update-status-submit-btn"
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {isUpdatingStatus ? 'Recording Event...' : 'Record Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Upload Consignment Document</h3>
              <button
                onClick={() => setIsDocModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="p-6 space-y-4">
              {docError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {docError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Document Title
                </label>
                <input
                  id="upload-doc-title-input"
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="e.g. Master Bill of Lading BL-904"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Document Type
                </label>
                <select
                  id="upload-doc-type-select"
                  value={docType}
                  onChange={e => setDocType(e.target.value as DocumentType)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2"
                >
                  <option value="BILL_OF_LADING">Bill of Lading</option>
                  <option value="INVOICE">Commercial Invoice</option>
                  <option value="CUSTOMS_DECLARATION">Customs Declaration</option>
                  <option value="DELIVERY_RECEIPT">Delivery Receipt / Proof of Delivery</option>
                  <option value="CERTIFICATE">Inspection Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Select File <span className="text-rose-500">*</span>
                </label>
                <input
                  id="upload-doc-file-input"
                  type="file"
                  required
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      if (!docTitle) {
                        setDocTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                      }
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  id="upload-doc-submit-btn"
                  type="submit"
                  disabled={isUploadingDoc || !selectedFile}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {isUploadingDoc ? 'Uploading...' : 'Upload to Storage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
