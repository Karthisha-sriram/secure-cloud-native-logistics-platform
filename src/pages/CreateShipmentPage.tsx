import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Plus, AlertCircle, Calendar, MapPin, User, Scale, Box } from 'lucide-react';
import { api } from '../api/client';
import { Customer, ShipmentPriority } from '../types';
import { useAuth } from '../context/AuthContext';

export const CreateShipmentPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);

  // Form Fields
  const [customerId, setCustomerId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [dimensions, setDimensions] = useState('40 x 30 x 25 cm');
  const [priority, setPriority] = useState<ShipmentPriority>('MEDIUM');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+1 (555) 019-2831');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.getCustomers({ size: 50 });
        setCustomers(res.content);
        if (res.content.length > 0) {
          setCustomerId(res.content[0].id);
        }
      } catch (err: any) {
        console.warn('Failed to load customers for selection', err);
      } finally {
        setIsLoadingCustomers(false);
      }
    };
    fetchCustomers();

    // Default expected delivery date: 5 days from today
    const d = new Date();
    d.setDate(d.getDate() + 5);
    setExpectedDeliveryDate(d.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!customerId) {
      setFormError('Please select a customer for this shipment.');
      return;
    }
    if (!origin.trim()) {
      setFormError('Origin address/hub is required.');
      return;
    }
    if (!destination.trim()) {
      setFormError('Destination address is required.');
      return;
    }
    if (!packageDescription.trim()) {
      setFormError('Package description is required.');
      return;
    }
    if (!weightKg || Number(weightKg) <= 0) {
      setFormError('Please enter a valid package weight in kilograms.');
      return;
    }
    if (!expectedDeliveryDate) {
      setFormError('Expected delivery date is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newShipment = await api.createShipment({
        customerId,
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

      navigate(`/shipments/${newShipment.id}`);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create consignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          id="create-shipment-back-btn"
          onClick={() => navigate('/shipments')}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            Book New Consignment
          </h1>
          <p className="text-xs text-slate-500">
            Generate an encrypted tracking ID, manifest, and dispatch order
          </p>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Section 1: Customer & Priority */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Customer & Consignment Level</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Customer Account <span className="text-rose-500">*</span>
                </label>
                <select
                  id="create-shipment-customer-select"
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  disabled={isLoadingCustomers}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.company} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Dispatch Priority <span className="text-rose-500">*</span>
                </label>
                <select
                  id="create-shipment-priority-select"
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
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Route Locations */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Route & Waypoints</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Origin (Dispatch Hub / Port) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="create-shipment-origin-input"
                  type="text"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  placeholder="e.g. Seattle Port Terminal 5, WA"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Destination (Receiver Address) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="create-shipment-destination-input"
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="e.g. 100 Innovation Way, Austin, TX"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Package Specifications */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span>Package Specifications & Cargo</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cargo Description <span className="text-rose-500">*</span>
                </label>
                <input
                  id="create-shipment-description-input"
                  type="text"
                  value={packageDescription}
                  onChange={e => setPackageDescription(e.target.value)}
                  placeholder="e.g. Precision Robotics Components (Fragile, Cleanroom Class 10)"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Weight (kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="create-shipment-weight-input"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 145.5"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Dimensions (L x W x H)
                </label>
                <input
                  id="create-shipment-dimensions-input"
                  type="text"
                  value={dimensions}
                  onChange={e => setDimensions(e.target.value)}
                  placeholder="e.g. 120 x 80 x 100 cm"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Estimated Delivery Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="create-shipment-eta-input"
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={e => setExpectedDeliveryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: Contact Information */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Recipient Contact & Dispatch Notes</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Person
                </label>
                <input
                  id="create-shipment-contact-name-input"
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Receiver name"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  id="create-shipment-contact-phone-input"
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Email
                </label>
                <input
                  id="create-shipment-contact-email-input"
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Special Handling / Customs Notes
                </label>
                <textarea
                  id="create-shipment-notes-input"
                  rows={2}
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Temperature monitored shipment. Keep between 2°C and 8°C."
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/shipments')}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            id="create-shipment-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Consignment...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Book Shipment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
