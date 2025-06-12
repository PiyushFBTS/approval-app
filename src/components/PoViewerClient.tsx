"use client";

import React, { useEffect, useState } from "react";
import { PurchaseOrder } from "@/types/purchase.type"
import { Button } from "@/components/ui/button";

const levelMap: Record<string, number> = {
  z65t: 1,
  p98m: 2,
  k98r: 3,
};

export default function PoViewerClient({
  params,
}: {
  params: { levelCode: string; companyName: string; documentNo: string };
}) {
  const { levelCode, companyName, documentNo } = params;

  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const approvalLevel = levelMap[levelCode];
  const [poData, setPoData] = useState<PurchaseOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const res = await fetch("/api/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentNo,
            companyName
          }),
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

    if (documentNo) fetchData();
  }, [documentNo, refresh]);

  const handleApprovalAction = async (status: 2 | 3) => {
    setLoading(true);
    if (status === 3 && rejectComment.trim() === "") {
      alert("Please provide a reason for rejection.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentNo,
          approvalStatus: status,
          approvalLevel: approvalLevel,
          comment: status === 3 ? rejectComment : "",
          companyName,
        }),
      });

      if (res.ok) {
        setRefresh(prev => !prev);
        setShowRejectReason(false);
        setRejectComment("");
      }
    } catch (err: any) {
      console.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
              <p><strong>Document Number:</strong> {poData.DocumentNo}</p>
              <p><strong>Vendor Name:</strong> {poData.BuyFromVendorName}</p>
              <p><strong>Vendor No:</strong> {poData.BuyFromVendorNo}</p>
              <p><strong>Order Date:</strong> {poData.OrderDate}</p>
              <p><strong>Store Name:</strong> {poData.StoreName}</p>
              <p><strong>Store No:</strong> {poData.StoreNo}</p>
            </div>

            {/* Approval Actions */}
            <div className="flex flex-col gap-3 mt-4">
              {(() => {
                const levelStr = `Level${approvalLevel}`;
                const isSameLevel = poData.ApprovalLevel === levelStr;
                const isFinalized = poData.ApprovalStatus === 'Approved' || poData.ApprovalStatus === 'Rejected';
                const isDisabled = !isSameLevel || isFinalized;

                return (
                  <>
                    <div className="flex gap-3">
                      <Button onClick={() => handleApprovalAction(2)} disabled={isDisabled} className="bg-green-600 hover:bg-green-700 text-white hover:text-white">
                        Approve
                      </Button>
                      <Button onClick={() => setShowRejectReason(true)} disabled={isDisabled} variant="destructive">
                        Reject
                      </Button>
                    </div>
                    {isDisabled && (
                      <p className="text-xs text-gray-500 italic mt-1">
                        {isFinalized
                          ? `This PO is ${poData.ApprovalStatus}.`
                          : `Approval available at ${poData.ApprovalLevel}.`}
                      </p>
                    )}
                    {showRejectReason && (
                      <div className="mt-2">
                        <textarea
                          value={rejectComment}
                          onChange={(e) => setRejectComment(e.target.value)}
                          placeholder="Enter rejection reason"
                          className="w-full border p-2 rounded"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => handleApprovalAction(3)}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Confirm Reject
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowRejectReason(false);
                              setRejectComment("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Line Items Table */}
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
