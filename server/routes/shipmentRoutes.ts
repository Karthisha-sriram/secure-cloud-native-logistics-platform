import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth';
import { ShipmentPriority, ShipmentStatus } from '../types';

const router = Router();

// GET /api/shipments
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let shipments = db.getShipments();

  // Role constraint: Customers only see their own shipments
  if (user.role === 'CUSTOMER') {
    if (user.customerId) {
      shipments = shipments.filter(s => s.customerId === user.customerId);
    } else {
      shipments = [];
    }
  }

  // Search filter (Tracking ID, customer name, origin, destination)
  const search = (req.query.search as string)?.trim().toLowerCase();
  if (search) {
    shipments = shipments.filter(
      s =>
        s.id.toLowerCase().includes(search) ||
        s.customerName.toLowerCase().includes(search) ||
        s.origin.toLowerCase().includes(search) ||
        s.destination.toLowerCase().includes(search) ||
        s.packageDescription.toLowerCase().includes(search)
    );
  }

  // Status filter
  const status = req.query.status as string;
  if (status && status !== 'ALL') {
    shipments = shipments.filter(s => s.currentStatus === status);
  }

  // Priority filter
  const priority = req.query.priority as string;
  if (priority && priority !== 'ALL') {
    shipments = shipments.filter(s => s.priority === priority);
  }

  // Origin filter
  const origin = req.query.origin as string;
  if (origin) {
    shipments = shipments.filter(s => s.origin.toLowerCase().includes(origin.toLowerCase()));
  }

  // Destination filter
  const destination = req.query.destination as string;
  if (destination) {
    shipments = shipments.filter(s => s.destination.toLowerCase().includes(destination.toLowerCase()));
  }

  // Sorting
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortDir = (req.query.sortDir as string)?.toLowerCase() === 'asc' ? 1 : -1;

  shipments.sort((a, b) => {
    if (sortBy === 'createdAt') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * sortDir;
    }
    if (sortBy === 'expectedDeliveryDate') {
      return (new Date(a.expectedDeliveryDate).getTime() - new Date(b.expectedDeliveryDate).getTime()) * sortDir;
    }
    if (sortBy === 'priority') {
      const pWeights: Record<ShipmentPriority, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
      return (pWeights[a.priority] - pWeights[b.priority]) * sortDir;
    }
    if (sortBy === 'status') {
      return a.currentStatus.localeCompare(b.currentStatus) * sortDir;
    }
    return 0;
  });

  // Pagination
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const size = Math.max(1, parseInt(req.query.size as string) || 10);
  const totalElements = shipments.length;
  const totalPages = Math.ceil(totalElements / size) || 1;
  const startIndex = (page - 1) * size;
  const paginatedContent = shipments.slice(startIndex, startIndex + size);

  res.json({
    content: paginatedContent,
    page,
    size,
    totalElements,
    totalPages,
    first: page === 1,
    last: page >= totalPages,
  });
});

// GET /api/shipments/:id
router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const shipment = db.findShipmentById(req.params.id);

  if (!shipment) {
    res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'NOT_FOUND',
      message: `Shipment with ID ${req.params.id} does not exist.`,
      path: req.originalUrl,
    });
    return;
  }

  // Check customer ownership
  if (user.role === 'CUSTOMER' && shipment.customerId !== user.customerId) {
    res.status(403).json({
      timestamp: new Date().toISOString(),
      status: 403,
      error: 'FORBIDDEN',
      message: 'You are not authorized to view this shipment.',
      path: req.originalUrl,
    });
    return;
  }

  const events = db.getShipmentEvents(shipment.id);
  const documents = db.getDocuments({ shipmentId: shipment.id });

  res.json({
    ...shipment,
    events,
    documents,
  });
});

// POST /api/shipments
router.post('/', authenticateToken, requireRole('ADMIN', 'OPERATIONS_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const {
    customerId,
    origin,
    destination,
    packageDescription,
    weightKg,
    dimensions,
    priority,
    expectedDeliveryDate,
    contactName,
    contactPhone,
    contactEmail,
    additionalNotes,
  } = req.body;

  // Backend Validation
  const errors: string[] = [];
  if (!customerId) errors.push('Customer is required.');
  if (!origin || !origin.trim()) errors.push('Origin location is required.');
  if (!destination || !destination.trim()) errors.push('Destination location is required.');
  if (!packageDescription || !packageDescription.trim()) errors.push('Package description is required.');
  if (!weightKg || Number(weightKg) <= 0) errors.push('Weight must be a positive number.');
  if (!expectedDeliveryDate) errors.push('Expected delivery date is required.');
  if (!contactName || !contactName.trim()) errors.push('Recipient contact name is required.');

  if (errors.length > 0) {
    res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'VALIDATION_ERROR',
      message: errors.join(' '),
      path: req.originalUrl,
    });
    return;
  }

  const customer = db.findCustomerById(customerId);
  const customerName = customer ? customer.company || customer.name : 'Enterprise Client';

  const newShipment = db.createShipment(
    {
      customerId,
      customerName,
      origin: origin.trim(),
      destination: destination.trim(),
      packageDescription: packageDescription.trim(),
      weightKg: Number(weightKg),
      dimensions: dimensions ? dimensions.trim() : 'Standard Pallet',
      priority: (priority as ShipmentPriority) || 'MEDIUM',
      currentStatus: 'CREATED',
      expectedDeliveryDate,
      contactName: contactName.trim(),
      contactPhone: contactPhone ? contactPhone.trim() : '',
      contactEmail: contactEmail ? contactEmail.trim() : '',
      additionalNotes: additionalNotes ? additionalNotes.trim() : '',
      createdByUserId: user.id,
    },
    user.name
  );

  res.status(201).json(newShipment);
});

// PUT /api/shipments/:id
router.put('/:id', authenticateToken, requireRole('ADMIN', 'OPERATIONS_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const existing = db.findShipmentById(req.params.id);
  if (!existing) {
    res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'NOT_FOUND',
      message: `Shipment with ID ${req.params.id} does not exist.`,
      path: req.originalUrl,
    });
    return;
  }

  const updates = req.body;
  if (updates.weightKg && Number(updates.weightKg) <= 0) {
    res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'VALIDATION_ERROR',
      message: 'Weight must be a positive number.',
      path: req.originalUrl,
    });
    return;
  }

  const updated = db.updateShipment(req.params.id, updates);
  res.json(updated);
});

// POST /api/shipments/:id/status
router.post('/:id/status', authenticateToken, requireRole('ADMIN', 'OPERATIONS_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { status, location, description } = req.body;

  if (!status) {
    res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'VALIDATION_ERROR',
      message: 'Status is required.',
      path: req.originalUrl,
    });
    return;
  }

  const updated = db.updateShipmentStatus(
    req.params.id,
    status as ShipmentStatus,
    location,
    description,
    user.id,
    user.name
  );

  if (!updated) {
    res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'NOT_FOUND',
      message: `Shipment ${req.params.id} not found.`,
      path: req.originalUrl,
    });
    return;
  }

  const events = db.getShipmentEvents(req.params.id);
  res.json({
    shipment: updated,
    events,
  });
});

// DELETE /api/shipments/:id
router.delete('/:id', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteShipment(req.params.id);
  if (!success) {
    res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'NOT_FOUND',
      message: `Shipment ${req.params.id} not found.`,
      path: req.originalUrl,
    });
    return;
  }

  res.json({ status: 'DELETED', id: req.params.id });
});

export default router;
