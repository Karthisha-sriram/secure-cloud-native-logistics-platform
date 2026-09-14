import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/analytics/overview
router.get('/overview', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let shipments = db.getShipments();
  const customers = db.getCustomers();

  // Role constraint
  if (user.role === 'CUSTOMER' && user.customerId) {
    shipments = shipments.filter(s => s.customerId === user.customerId);
  }

  const totalShipments = shipments.length;
  const inTransit = shipments.filter(s => s.currentStatus === 'IN_TRANSIT').length;
  const outForDelivery = shipments.filter(s => s.currentStatus === 'OUT_FOR_DELIVERY').length;
  const delivered = shipments.filter(s => s.currentStatus === 'DELIVERED').length;
  const delayed = shipments.filter(s => s.currentStatus === 'DELAYED').length;
  const pending = shipments.filter(
    s => s.currentStatus === 'CREATED' || s.currentStatus === 'PICKED_UP' || s.currentStatus === 'ARRIVED_AT_FACILITY'
  ).length;

  const activeCustomers = new Set(
    shipments.filter(s => s.currentStatus !== 'DELIVERED' && s.currentStatus !== 'CANCELLED').map(s => s.customerId)
  ).size;

  const deliverySuccessRate =
    totalShipments > 0 ? Math.round((delivered / (delivered + delayed || 1)) * 100) : 100;

  // Status breakdown
  const statusDistribution = [
    { name: 'In Transit', value: inTransit, color: '#2563eb' },
    { name: 'Delivered', value: delivered, color: '#16a34a' },
    { name: 'Delayed', value: delayed, color: '#dc2626' },
    { name: 'Out for Delivery', value: outForDelivery, color: '#06b6d4' },
    { name: 'Pending / Facility', value: pending, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  // Volume over time (Mock 6-month aggregate based on database scale)
  const volumeOverTime = [
    { month: 'Apr', shipments: Math.max(12, totalShipments * 2), onTime: Math.max(11, totalShipments * 2 - 2), delayed: 1 },
    { month: 'May', shipments: Math.max(15, totalShipments * 3), onTime: Math.max(14, totalShipments * 3 - 2), delayed: 2 },
    { month: 'Jun', shipments: Math.max(18, totalShipments * 4), onTime: Math.max(17, totalShipments * 4 - 3), delayed: 1 },
    { month: 'Jul', shipments: Math.max(22, totalShipments * 5), onTime: Math.max(20, totalShipments * 5 - 4), delayed: 3 },
    { month: 'Aug', shipments: Math.max(28, totalShipments * 6), onTime: Math.max(26, totalShipments * 6 - 3), delayed: 2 },
    { month: 'Sep', shipments: totalShipments, onTime: delivered + inTransit, delayed: delayed },
  ];

  // Priority distribution
  const priorityDistribution = [
    { priority: 'CRITICAL', count: shipments.filter(s => s.priority === 'CRITICAL').length },
    { priority: 'HIGH', count: shipments.filter(s => s.priority === 'HIGH').length },
    { priority: 'MEDIUM', count: shipments.filter(s => s.priority === 'MEDIUM').length },
    { priority: 'LOW', count: shipments.filter(s => s.priority === 'LOW').length },
  ];

  // Regional breakdown
  const regionalActivity = [
    { region: 'North America', shipments: shipments.filter(s => s.origin.includes('USA') || s.destination.includes('USA')).length },
    { region: 'Europe', shipments: shipments.filter(s => s.origin.includes('Germany') || s.origin.includes('France') || s.origin.includes('Switzerland') || s.destination.includes('Netherlands') || s.destination.includes('Sweden') || s.destination.includes('UK')).length },
    { region: 'Asia-Pacific', shipments: shipments.filter(s => s.origin.includes('Japan') || s.origin.includes('China')).length },
  ];

  res.json({
    metrics: {
      totalShipments,
      inTransit,
      outForDelivery,
      delivered,
      delayed,
      pending,
      activeCustomers: user.role === 'CUSTOMER' ? 1 : (activeCustomers || customers.length),
      totalCustomers: customers.length,
      deliverySuccessRate,
      averageDeliveryDays: 3.4,
    },
    statusDistribution,
    volumeOverTime,
    priorityDistribution,
    regionalActivity,
  });
});

export default router;
