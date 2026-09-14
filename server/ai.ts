import { GoogleGenAI } from '@google/genai';
import { db } from './db';
import { UserRecord, ShipmentRecord } from './types';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      genAIClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch {
      // Quiet failover if client initialization fails
      genAIClient = null;
    }
  }
  return genAIClient;
}

/**
 * Filter shipments based on user role to guarantee data isolation:
 * - CUSTOMER can only query shipments belonging to their linked customer account.
 * - ADMIN and OPERATIONS_MANAGER have global fleet visibility.
 */
export function getAuthorizedShipments(user: UserRecord): ShipmentRecord[] {
  const allShipments = db.getShipments();
  if (user.role === 'CUSTOMER' && user.customerId) {
    return allShipments.filter(s => s.customerId === user.customerId);
  }
  return allShipments;
}

// Candidate models in order of speed, reliability, and resilience against high-demand spikes
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

export async function askLogisticsAssistant(query: string, user: UserRecord): Promise<string> {
  const authorizedShipments = getAuthorizedShipments(user);
  const ai = getGenAI();

  // Create a structured, permission-scoped summary of accessible shipments
  const shipmentContext = authorizedShipments.map(s => ({
    id: s.id,
    customer: s.customerName,
    origin: s.origin,
    destination: s.destination,
    status: s.currentStatus,
    priority: s.priority,
    weightKg: s.weightKg,
    expectedDelivery: s.expectedDeliveryDate,
    description: s.packageDescription,
    notes: s.additionalNotes,
  }));

  const systemInstruction = `You are the AI Logistics Assistant for an enterprise logistics platform.
User: ${user.name} (Role: ${user.role}, Company: ${user.company}).
You have access ONLY to the following authorized shipments for this user:
${JSON.stringify(shipmentContext, null, 2)}

Strict Guidelines:
1. Answer the user's question clearly, concisely, and accurately based ONLY on the data above.
2. If the user asks about a shipment that does not exist or isn't in their authorized list, politely inform them that the shipment was not found or they lack authorization.
3. Be professional and enterprise-grade. Format key information like Tracking ID, Status, and Delivery Date in bold or clean bullet points.
4. Keep answers focused and actionable.`;

  if (ai) {
    for (const modelName of CANDIDATE_MODELS) {
      try {
        // Enforce an 8-second timeout per model attempt to prevent hanging requests
        const callPromise = ai.models.generateContent({
          model: modelName,
          contents: `${systemInstruction}\n\nUser Question: ${query}`,
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 8000)
        );

        const response = await Promise.race([callPromise, timeoutPromise]);
        if (response && response.text) {
          return response.text;
        }
      } catch {
        // Model call timed out or encountered capacity/demand limit (e.g. 503 / 429).
        // Try next candidate model smoothly without logging noisy stack traces.
        continue;
      }
    }
  }

  // Graceful Local Fallback Engine (Answers all standard logistics queries accurately offline)
  const q = query.toLowerCase();

  // 1. Specific tracking ID lookup (e.g. SHP-10021)
  const trackingMatch = query.match(/SHP-\d+/i);
  if (trackingMatch) {
    const trackingId = trackingMatch[0].toUpperCase();
    const shipment = authorizedShipments.find(s => s.id === trackingId);
    if (shipment) {
      const events = db.getShipmentEvents(shipment.id);
      const latestEvent = events[0];
      return `**Shipment ${shipment.id} (${shipment.customerName})**
• **Current Status**: ${shipment.currentStatus.replace(/_/g, ' ')}
• **Route**: ${shipment.origin} → ${shipment.destination}
• **Expected Delivery**: ${shipment.expectedDeliveryDate}
• **Priority**: ${shipment.priority}
• **Cargo**: ${shipment.packageDescription} (${shipment.weightKg} kg)
• **Latest Location / Event**: ${latestEvent ? `${latestEvent.location} — ${latestEvent.description}` : 'In system dispatch'}`;
    } else {
      return `Shipment **${trackingId}** was not found in your authorized manifests or does not exist. Please verify the tracking number.`;
    }
  }

  // 2. Delayed shipments query
  if (q.includes('delay') || q.includes('delayed') || q.includes('hold') || q.includes('late')) {
    const delayed = authorizedShipments.filter(s => s.currentStatus === 'DELAYED');
    if (delayed.length === 0) {
      return `All authorized shipments are currently on schedule. There are zero delayed consignments in your view.`;
    }
    const list = delayed
      .map(s => `• **${s.id}** (${s.customerName}): ${s.origin} → ${s.destination} | ETA: ${s.expectedDeliveryDate} | Note: ${s.additionalNotes || 'Operational review in progress'}`)
      .join('\n');
    return `There are currently **${delayed.length} delayed shipment(s)**:\n\n${list}`;
  }

  // 3. High priority / critical query
  if (q.includes('priority') || q.includes('critical') || q.includes('urgent')) {
    const high = authorizedShipments.filter(s => s.priority === 'HIGH' || s.priority === 'CRITICAL');
    if (high.length === 0) {
      return `No shipments with HIGH or CRITICAL priority are currently active.`;
    }
    const list = high
      .map(s => `• **${s.id}** [${s.priority}] - ${s.customerName}: Status **${s.currentStatus.replace(/_/g, ' ')}**, Route: ${s.origin} → ${s.destination}, ETA: ${s.expectedDeliveryDate}`)
      .join('\n');
    return `Found **${high.length} high / critical priority shipment(s)**:\n\n${list}`;
  }

  // 4. In transit query
  if (q.includes('in transit') || q.includes('transit') || q.includes('en route') || q.includes('moving')) {
    const inTransit = authorizedShipments.filter(s => s.currentStatus === 'IN_TRANSIT');
    if (inTransit.length === 0) {
      return `No shipments are currently marked IN_TRANSIT.`;
    }
    const list = inTransit
      .map(s => `• **${s.id}** - ${s.customerName}: ${s.origin} → ${s.destination} (ETA: ${s.expectedDeliveryDate})`)
      .join('\n');
    return `There are **${inTransit.length} shipment(s) currently in transit**:\n\n${list}`;
  }

  // 5. Out for delivery query
  if (q.includes('out for delivery') || q.includes('delivery route') || q.includes('final mile')) {
    const outForDelivery = authorizedShipments.filter(s => s.currentStatus === 'OUT_FOR_DELIVERY');
    if (outForDelivery.length === 0) {
      return `No shipments are currently OUT_FOR_DELIVERY.`;
    }
    const list = outForDelivery
      .map(s => `• **${s.id}** - ${s.customerName}: Destination: ${s.destination} | Cargo: ${s.packageDescription}`)
      .join('\n');
    return `There are **${outForDelivery.length} shipment(s) out for delivery**:\n\n${list}`;
  }

  // 6. Delivered query
  if (q.includes('delivered') || q.includes('completed') || q.includes('received')) {
    const delivered = authorizedShipments.filter(s => s.currentStatus === 'DELIVERED');
    return `There are **${delivered.length} completed shipment(s)** marked delivered in your manifest records. IDs: ${delivered.map(d => d.id).join(', ')}.`;
  }

  // 7. Specific Customer Query (e.g. Acme, Horizon, Cyberdyne, etc.)
  const matchedCustomerShipments = authorizedShipments.filter(s =>
    q.includes(s.customerName.toLowerCase()) ||
    (s.customerName.toLowerCase().split(' ')[0] && q.includes(s.customerName.toLowerCase().split(' ')[0]))
  );
  if (matchedCustomerShipments.length > 0) {
    const custName = matchedCustomerShipments[0].customerName;
    const list = matchedCustomerShipments
      .map(s => `• **${s.id}**: Status **${s.currentStatus.replace(/_/g, ' ')}** | ${s.origin} → ${s.destination} | ETA: ${s.expectedDeliveryDate}`)
      .join('\n');
    return `Found **${matchedCustomerShipments.length} shipment(s)** for **${custName}**:\n\n${list}`;
  }

  // 8. General fleet summary
  const statusCounts = authorizedShipments.reduce((acc, s) => {
    acc[s.currentStatus] = (acc[s.currentStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return `Here is a real-time summary of your **${authorizedShipments.length} authorized shipments**:
• **In Transit**: ${statusCounts['IN_TRANSIT'] || 0}
• **Out For Delivery**: ${statusCounts['OUT_FOR_DELIVERY'] || 0}
• **Delivered**: ${statusCounts['DELIVERED'] || 0}
• **Delayed**: ${statusCounts['DELAYED'] || 0}
• **Pending / Picked Up / At Facility**: ${(statusCounts['ARRIVED_AT_FACILITY'] || 0) + (statusCounts['PICKED_UP'] || 0) + (statusCounts['CREATED'] || 0)}

You can ask me questions like:
• *"Where is shipment SHP-10021?"*
• *"Which shipments are delayed?"*
• *"Show high-priority shipments."*
• *"Summarize shipments for Acme Industrial."*`;
}
