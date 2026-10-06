import { NextResponse } from "next/server";

export interface LiveOrder {
  id: string;
  storeId: string;
  storeName: string;
  storeLocality: string;
  storeAddress: string;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  deliveryFee: number;
  customerAddress: string;
  customerPhone: string;
  status: "PENDING" | "ACCEPTED" | "PREPARING" | "READY_FOR_PICKUP" | "PICKED_UP" | "DELIVERED";
  riderId?: string;
  riderName?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory server-side shared orders
let globalOrders: LiveOrder[] = [
  {
    id: "BLR-892101",
    storeId: "store-1",
    storeName: "MTR Foods Outlet",
    storeLocality: "Indiranagar",
    storeAddress: "100ft Road, Indiranagar, Bengaluru",
    items: [
      { name: "Masala Dosa", price: 80, quantity: 2 },
      { name: "Filter Coffee", price: 30, quantity: 2 },
    ],
    totalAmount: 220,
    deliveryFee: 25,
    customerAddress: "42, 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru",
    customerPhone: "+91 98450 11223",
    status: "READY_FOR_PICKUP",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "BLR-741902",
    storeId: "store-2",
    storeName: "Namdhari's Fresh Supermarket",
    storeLocality: "Indiranagar",
    storeAddress: "CMH Road, Indiranagar, Bengaluru",
    items: [
      { name: "Organic Milk 1L", price: 45, quantity: 2 },
      { name: "Whole Wheat Bread", price: 40, quantity: 1 },
      { name: "Farm Fresh Eggs (6)", price: 55, quantity: 1 },
    ],
    totalAmount: 185,
    deliveryFee: 25,
    customerAddress: "Flat 304, Green Heights, Defence Colony, Bengaluru",
    customerPhone: "+91 97410 44556",
    status: "DELIVERED",
    riderId: "rider-1",
    riderName: "Ramesh K.",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");
  const riderId = searchParams.get("riderId");

  let list = [...globalOrders];
  if (storeId && storeId !== "all") {
    list = list.filter((o) => o.storeId === storeId);
  }
  if (riderId && riderId !== "all") {
    list = list.filter((o) => o.riderId === riderId || o.status === "READY_FOR_PICKUP");
  }

  // Return latest first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    orders: list,
    timestamp: Date.now(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newOrder: LiveOrder = {
      id: `BLR-${Math.floor(100000 + Math.random() * 900000)}`,
      storeId: body.storeId || "store-1",
      storeName: body.storeName || "MTR Foods Outlet",
      storeLocality: body.storeLocality || "Indiranagar",
      storeAddress: body.storeAddress || "Indiranagar, Bengaluru",
      items: body.items || [],
      totalAmount: body.totalAmount || 100,
      deliveryFee: body.deliveryFee ?? 25,
      customerAddress: body.customerAddress || "Bengaluru",
      customerPhone: body.customerPhone || "+91 98765 43210",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    globalOrders.unshift(newOrder);

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, riderId, riderName } = body;

    const order = globalOrders.find((o) => o.id === orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (status) order.status = status;
    if (riderId) order.riderId = riderId;
    if (riderName) order.riderName = riderName;
    order.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
