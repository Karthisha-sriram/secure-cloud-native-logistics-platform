import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, RefreshCw, Package, MapPin, User } from 'lucide-react';
import { api } from '../api/client';
import { Shipment, ShipmentPriority } from '../types';

export const EditShipmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [dimensions, setDimensions] = useState('');
  const [priority, setPriority] = useState<ShipmentPriority>('MEDIUM');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchShipment = async () => {
      setIsLoading(true);
      try {
        const data = await api.getShipmentById(id);
        setShipment(data);
        setOrigin(data.origin);
        setDestination(data.destination);
        setPackageDescription(data.packageDescription);
        setWeightKg(data.weightKg);
        setDimensions(data.dimensions);
        setPriority(data.priority);
        setExpectedDeliveryDate(data.expectedDeliveryDate);
        setContactName(data.contactName);
        setContactPhone(data.contactPhone);
        setContactEmail(data.contactEmail);
        setAdditionalNotes(data.additionalNotes || '');
      } catch (err: any) {
        setFormError(err?.message || 'Failed to load shipment details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchShipment();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setFormError(null);

    if (!origin.trim() || !destination.trim() || !packageDescription.trim()) {
      setFormError('Origin, destination, and package description cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      await api.updateShipment(id, {
        origin: origin.trim(),
        destination: destination.trim(),
        packageDescription: packageDescription.trim(),
        weightKg: Number(weightKg),
        dimensions: dimensions.trim(),
        priority,
        expectedDeliveryDate,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        additionalNotes: additionalNotes.trim(),
      });
      navigate(`/shipments/${id}`);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to update shipment.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-slate-500 text-xs">
        <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
        <span>Loading consignment details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/shipments/${id}`)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            Edit Consignment {id}
          </h1>
          <p className="text-xs text-slate-500">
            Customer: {shipment?.customerName}
          </p>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Priority */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Priority
            </h3>
            <div className="max-w-xs">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Dispatch Priority
              </label>
              <select
                id="edit-shipment-priority-select"
                value={priority}
                onChange={e => setPriority(e.target.value as ShipmentPriority)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600"
              >
                <option value="LOW">Low (Standard Freight)</option>
                <option value="MEDIUM">Medium (Expedited Air/Ground)</option>
                <option value="HIGH">High (Priority Urgent Delivery)</option>
                <option value="CRITICAL">Critical (Time-Definite Same Day)</option>
              </select>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Route */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Route & Waypoints</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Origin</label>
                <input
                  id="edit-shipment-origin-input"
                  type="text"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Destination</label>
                <input
                  id="edit-shipment-destination-input"
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Cargo Specs */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span>Cargo Specifications</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <input
                  id="edit-shipment-description-input"
                  type="text"
                  value={packageDescription}
                  onChange={e => setPackageDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Weight (kg)</label>
                <input
                  id="edit-shipment-weight-input"
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Dimensions</label>
                <input
                  id="edit-shipment-dimensions-input"
                  type="text"
                  value={dimensions}
                  onChange={e => setDimensions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Estimated Delivery</label>
                <input
                  id="edit-shipment-eta-input"
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={e => setExpectedDeliveryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Contact Person</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
                <input
                  id="edit-shipment-contact-name-input"
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                <input
                  id="edit-shipment-contact-phone-input"
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                <input
                  id="edit-shipment-contact-email-input"
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">Handling Notes</label>
                <textarea
                  id="edit-shipment-notes-input"
                  rows={2}
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/shipments/${id}`)}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            id="edit-shipment-submit-btn"
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Consignment'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
