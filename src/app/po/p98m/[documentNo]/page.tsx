"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PurchaseOrder } from "@/types/purchase.type"


export default function Page() {
  const { documentNo } = useParams();
  const [poData, setPoData] = useState<PurchaseOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const decodedDocNo = decodeURIComponent(documentNo as string);
        const res = await fetch("/api/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentNo: decodedDocNo }),
        });

        const rawXML = await res.text();

        if (res.ok) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(rawXML, "text/xml");

          const returnValue = xmlDoc.getElementsByTagName("return_value")[0]?.textContent;

          if (returnValue) {
            const parsedData = JSON.parse(returnValue);
            setPoData(parsedData);
          } else {
            setError("return_value not found in XML");
          }
        } else {
          setError("Failed to fetch PO data");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      }
    };

    if (documentNo) {
      fetchData();
    }
  }, [documentNo]);


  return (
    <div className="p-6 mt-10">
      <h1 className="text-xl font-semibold">PO Viewer</h1>
      {error && <p className="text-red-600">Error: {error}</p>}
      {!poData && !error && <p className="text-gray-500">Loading PO details...</p>}

      {poData && (
        <div className="mt-6 space-y-6">
          {/* Vendor Details */}
          <div className="bg-white p-2 rounded shadow">
            <h3 className="text-lg font-semibold mb-3 border-b pb-1">Vendor Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <p><strong>PO Number:</strong> {poData.DocumentNo}</p>
              <p><strong>Vendor Name:</strong> {poData.BuyFromVendorName}</p>
              <p><strong>Vendor No:</strong> {poData.BuyFromVendorNo}</p>
              <p><strong>Order Date:</strong> {poData.OrderDate}</p>
              <p><strong>Store Name:</strong> {poData.StoreName}</p>
              <p><strong>Store No:</strong> {poData.StoreNo}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white p-2 rounded shadow">
            <h3 className="text-lg font-semibold mb-3 border-b pb-1">Lines (Order Details)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-300">
                <thead>
                  <tr className="bg-pink-200">
                    <th className="border px-2 py-1">S No.</th>
                    <th className="border px-2 py-1">Item Name</th>
                    <th className="border px-2 py-1">Quantity</th>
                    <th className="border px-2 py-1">Rate</th>
                    <th className="border px-2 py-1">Net Amount</th>
                    <th className="border px-2 py-1">GST Amount</th>
                    <th className="border px-2 py-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {poData.Lines.map((item, index) => {
                    const rate = parseFloat(item.DirectUnitCost.replace(/,/g, ""));
                    const quantity = parseFloat(item.Quantity);
                    const gst = parseFloat(item.GstAmount);
                    const netTotal = rate * quantity;
                    const total = netTotal + gst;

                    return (
                      <tr key={index} className="bg-pink-50">
                        <td className="border px-2 py-1 text-center">{index + 1}</td>
                        <td className="border px-2 py-1 text-left">{item.Description}</td>
                        <td className="border px-2 py-1 text-center">{quantity}</td>
                        <td className="border px-2 py-1 text-center">₹{rate.toFixed(2)}</td>
                        <td className="border px-2 py-1 text-center">₹{netTotal.toFixed(2)}</td>
                        <td className="border px-2 py-1 text-center">₹{gst.toFixed(2)}</td>
                        <td className="border px-2 py-1 text-center">₹{total.toFixed(2)}</td>
                      </tr>
                    );
                  })}

                  {/* Grand Total Row */}
                  <tr className="bg-sky-100 font-bold text-right">
                    <td className="border px-2 py-2 text-center" colSpan={2}>Grand Total</td>
                    <td className="border px-2 py-2 text-center">
                      {poData.Lines.reduce((sum, item) => sum + parseFloat(item.Quantity), 0)} items
                    </td>
                    <td className="border px-2 py-2"></td>
                    <td className="border px-2 py-2 text-center">
                      ₹{poData.Lines.reduce((sum, item) => {
                        const rate = parseFloat(item.DirectUnitCost.replace(/,/g, ""));
                        const qty = parseFloat(item.Quantity);
                        return sum + (rate * qty);
                      }, 0).toFixed(2)}
                    </td>
                    <td className="border px-2 py-2 text-center">
                      ₹{poData.Lines.reduce((sum, item) => sum + parseFloat(item.GstAmount), 0).toFixed(2)}
                    </td>
                    <td className="border px-2 py-2 text-center text-green-700">
                      ₹{poData.Lines.reduce((sum, item) => {
                        const rate = parseFloat(item.DirectUnitCost.replace(/,/g, ""));
                        const qty = parseFloat(item.Quantity);
                        const gst = parseFloat(item.GstAmount);
                        return sum + (rate * qty) + gst;
                      }, 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
