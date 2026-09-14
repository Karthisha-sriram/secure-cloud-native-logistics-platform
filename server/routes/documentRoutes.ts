import { Router, Response } from 'express';
import multer from 'multer';
import { db } from '../db';
import { storageService } from '../storage';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth';
import { DocumentType } from '../types';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// GET /api/documents
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let docs = db.getDocuments();

  // Role constraint
  if (user.role === 'CUSTOMER' && user.customerId) {
    const customerShipments = db.getShipments().filter(s => s.customerId === user.customerId);
    const shipmentIds = new Set(customerShipments.map(s => s.id));
    docs = docs.filter(d => (d.customerId && d.customerId === user.customerId) || (d.shipmentId && shipmentIds.has(d.shipmentId)));
  }

  // Filter by shipmentId
  const shipmentId = req.query.shipmentId as string;
  if (shipmentId) {
    docs = docs.filter(d => d.shipmentId === shipmentId);
  }

  // Filter by documentType
  const documentType = req.query.documentType as string;
  if (documentType && documentType !== 'ALL') {
    docs = docs.filter(d => d.documentType === documentType);
  }

  // Search
  const search = (req.query.search as string)?.trim().toLowerCase();
  if (search) {
    docs = docs.filter(
      d =>
        d.title.toLowerCase().includes(search) ||
        d.fileName.toLowerCase().includes(search) ||
        (d.shipmentId && d.shipmentId.toLowerCase().includes(search))
    );
  }

  res.json({
    documents: docs,
    total: docs.length,
    storageProvider: storageService.getProviderName(),
  });
});

// GET /api/documents/:id
router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const doc = db.findDocumentById(req.params.id);
  if (!doc) {
    res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'NOT_FOUND',
      message: `Document ${req.params.id} not found.`,
      path: req.originalUrl,
    });
    return;
  }
  res.json(doc);
});

// GET /api/documents/:id/download
router.get('/:id/download', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const doc = db.findDocumentById(req.params.id);
  if (!doc) {
    res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'NOT_FOUND',
      message: `Document ${req.params.id} not found.`,
      path: req.originalUrl,
    });
    return;
  }

  const fileData = await storageService.getFile(doc.storagePath);
  if (!fileData) {
    res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'FILE_NOT_FOUND',
      message: 'File content could not be located in object storage.',
      path: req.originalUrl,
    });
    return;
  }

  res.setHeader('Content-Type', fileData.mimeType || doc.fileType || 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.fileName)}"`);
  res.setHeader('Content-Length', fileData.buffer.length);
  res.send(fileData.buffer);
});

// POST /api/documents/upload
router.post(
  '/upload',
  authenticateToken,
  requireRole('ADMIN', 'OPERATIONS_MANAGER'),
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const file = req.file;

    if (!file) {
      res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'No file uploaded. Please provide a file binary.',
        path: req.originalUrl,
      });
      return;
    }

    const { title, documentType, shipmentId, customerId } = req.body;
    if (!title) {
      res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'Document title is required.',
        path: req.originalUrl,
      });
      return;
    }

    try {
      const uploadResult = await storageService.uploadFile(file.originalname, file.buffer, file.mimetype);

      const newDoc = db.createDocument({
        title: title.trim(),
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        documentType: (documentType as DocumentType) || 'INVOICE',
        shipmentId: shipmentId || undefined,
        customerId: customerId || undefined,
        storagePath: uploadResult.storagePath,
        storageProvider: uploadResult.storageProvider,
        uploadedByUserId: user.id,
        uploadedByName: user.name,
      });

      res.status(201).json(newDoc);
    } catch (err: any) {
      console.error('Storage upload failed:', err);
      res.status(500).json({
        timestamp: new Date().toISOString(),
        status: 500,
        error: 'STORAGE_ERROR',
        message: err?.message || 'Failed to upload document to storage.',
        path: req.originalUrl,
      });
    }
  }
);

// DELETE /api/documents/:id
router.delete('/:id', authenticateToken, requireRole('ADMIN', 'OPERATIONS_MANAGER'), async (req: AuthenticatedRequest, res: Response) => {
  const doc = db.findDocumentById(req.params.id);
  if (!doc) {
    res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'NOT_FOUND',
      message: `Document ${req.params.id} not found.`,
      path: req.originalUrl,
    });
    return;
  }

  await storageService.deleteFile(doc.storagePath);
  db.deleteDocument(doc.id);

  res.json({ status: 'DELETED', id: doc.id });
});

export default router;
