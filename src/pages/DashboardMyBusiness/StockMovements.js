import React from 'react'
import { Card, CardBody, CardHeader } from "reactstrap";

const StockMovements = () => {
     
  const stockData = [
    {
      product: "Amoxicillin 500mg",
      category: "Antibiotics",
      currentStock: 120,
      reorderLevel: 200,
      sold: 350,
      avgDailyUsage: 12,
      supplier: "MedSupply Ltd",
      lastPurchaseDate: "2026-06-10",
      status: "Low Stock",
      statusColor: "danger",
    },
    {
      product: "Paracetamol 500mg",
      category: "Painkillers",
      currentStock: 800,
      reorderLevel: 300,
      sold: 1200,
      avgDailyUsage: 40,
      supplier: "PharmaPlus",
      lastPurchaseDate: "2026-05-28",
      status: "Normal",
      statusColor: "warning",
    },
    {
      product: "Vitamin C Tablets",
      category: "Supplements",
      currentStock: 1500,
      reorderLevel: 400,
      sold: 200,
      avgDailyUsage: 5,
      supplier: "HealthCorp",
      lastPurchaseDate: "2026-04-20",
      status: "Overstock",
      statusColor: "info",
    },
     {
    product: "Metformin 500mg",
    category: "Diabetes",
    currentStock: 90,
    reorderLevel: 150,
    sold: 600,
    avgDailyUsage: 20,
    supplier: "MedLife Supplies",
    lastPurchaseDate: "2026-06-05",
    status: "Low Stock",
    statusColor: "danger",
  },
  {
    product: "Ibuprofen 400mg",
    category: "Painkillers",
    currentStock: 600,
    reorderLevel: 250,
    sold: 900,
    avgDailyUsage: 30,
    supplier: "PharmaPlus",
    lastPurchaseDate: "2026-06-12",
    status: "Normal",
    statusColor: "warning",
  },
  ]
  return (
         <Card className="card-height-100">
         <CardHeader className="align-items-center d-flex">
       <h4 className="card-title mb-0 flex-grow-1">
  Stock Alerts & Movement Tracking
</h4>
              </CardHeader>
              <CardBody>
    <div className="table-responsive table-card">
  <table className="table table-borderless table-centered table-nowrap mb-0">
    <thead className="text-muted table-light">
      <tr>
        <th>Product</th>
        <th>Category</th>
        <th>Stock</th>
        <th>Reorder</th>
        <th>Sold (30d)</th>
        <th>Supplier</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
      {stockData.length === 0 ? (
        <tr>
          <td colSpan="7" className="text-center py-5">
            <h6 className="text-muted mb-0">No stock data found</h6>
          </td>
        </tr>
      ) : (
        stockData.map((item, index) => (
          <tr key={index}>
            <td className="fw-medium">{item.product}</td>
            <td className="text-muted">{item.category}</td>

            <td>{item.currentStock}</td>
            <td>{item.reorderLevel}</td>
            <td>{item.sold}</td>
            <td>{item.supplier}</td>

            <td>
              <span
                className={`badge bg-${item.statusColor}-subtle text-${item.statusColor}`}
              >
                {item.status}
              </span>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
  </CardBody>
       </Card>  )
}

export default StockMovements
