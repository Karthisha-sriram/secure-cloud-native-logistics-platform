import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/customers
router.get('/', authenticateToken, requireRole('ADMIN', 'OPERATIONS_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  let customers = db.getCustomers();
  const allShipments = db.getShipments();

  // Search filter
  const search = (req.query.search as string)?.trim().toLowerCase();
  if (search) {
    customers = customers.filter(
      c =>
        c.name.toLowerCase().includes(search) ||
        c.company.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.city.toLowerCase().includes(search) ||
        c.country.toLowerCase().includes(search) ||
        c.id.toLowerCase().includes(search)
    );
  }

  // Calculate dynamic shipment counts for each customer
  const enriched = customers.map(c => {
    const custShipments = allShipments.filter(s => s.customerId === c.id);
    const activeShipments = custShipments.filter(s => s.currentStatus !== 'DELIVERED' && s.currentStatus !== 'CANCELLED');
    return {
      ...c,
      totalShipmentsCount: custShipments.length,
      activeShipmentsCount: activeShipments.length,
      deliveredShipmentsCount: custShipments.filter(s => s.currentStatus === 'DELIVERED').length,
    };
  });

  // Sorting
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  enriched.sort((a: any, b: any) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'company') return a.company.localeCompare(b.company);
    if (sortBy === 'activeShipments') return b.activeShipmentsCount - a.activeShipmentsCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Pagination
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const size = Math.max(1, parseInt(req.query.size as string) || 10);
  const totalElements = enriched.length;
  const totalPages = Math.ceil(totalElements / size) || 1;
  const startIndex = (page - 1) * size;
  const paginatedContent = enriched.slice(startIndex, startIndex + size);

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

// GET /api/customers/:id
router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const customer = db.findCustomerById(req.params.id);

  if (!customer) {
    res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'NOT_FOUND',
      message: `Customer with ID ${req.params.id} does not exist.`,
      path: req.originalUrl,
    });
    return;
  }

  // Role check: Customer role can only view their own profile
  if (user.role === 'CUSTOMER' && user.customerId !== customer.id) {
    res.status(403).json({
      timestamp: new Date().toISOString(),
      status: 403,
      error: 'FORBIDDEN',
      message: 'You are not authorized to view this customer.',
      path: req.originalUrl,
    });
    return;
  }

  const allShipments = db.getShipments().filter(s => s.customerId === customer.id);
  const activeShipments = allShipments.filter(s => s.currentStatus !== 'DELIVERED' && s.currentStatus !== 'CANCELLED');
  const deliveredShipments = allShipments.filter(s => s.currentStatus === 'DELIVERED');
  const delayedShipments = allShipments.filter(s => s.currentStatus === 'DELAYED');

  const deliverySuccessRate =
    allShipments.length > 0
      ? Math.round((deliveredShipments.length / (deliveredShipments.length + delayedShipments.length || 1)) * 100)
      : 100;

  res.json({
    ...customer,
    shipments: allShipments,
    stats: {
      totalShipments: allShipments.length,
      activeShipments: activeShipments.length,
      deliveredShipments: deliveredShipments.length,
      delayedShipments: delayedShipments.length,
      deliverySuccessRate,
    },
  });
});

// POST /api/customers
router.post('/', authenticateToken, requireRole('ADMIN', 'OPERATIONS_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const { name, company, email, phone, address, city, country, notes } = req.body;

  if (!name || !company || !email) {
    res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'VALIDATION_ERROR',
      message: 'Name, Company, and Email are required fields.',
      path: req.originalUrl,
    });
    return;
  }

  const newCustomer = db.createCustomer({
    name: name.trim(),
    company: company.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : '',
    address: address ? address.trim() : '',
    city: city ? city.trim() : '',
    country: country ? country.trim() : 'USA',
    accountStatus: 'ACTIVE',
    notes: notes ? notes.trim() : '',
  });

  res.status(201).json(newCustomer);
});

// PUT /api/customers/:id
router.put('/:id', authenticateToken, requireRole('ADMIN', 'OPERATIONS_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const customer = db.findCustomerById(req.params.id);
  if (!customer) {
    res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'NOT_FOUND',
      message: `Customer with ID ${req.params.id} does not exist.`,
      path: req.originalUrl,
    });
    return;
  }

  const updated = db.updateCustomer(req.params.id, req.body);
  res.json(updated);
});

// DELETE /api/customers/:id
router.delete('/:id', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteCustomer(req.params.id);
  if (!success) {
    res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'NOT_FOUND',
      message: `Customer with ID ${req.params.id} does not exist.`,
      path: req.originalUrl,
    });
    return;
  }

  res.json({ status: 'DELETED', id: req.params.id });
});

export default router;
