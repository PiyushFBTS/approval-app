"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PurchaseOrder } from "@/types/purchase.type";
import { Button } from "@/components/ui/button";

const levelMap: Record<string, number> = {
    z65t: 1,
    p98m: 2,
    k98r: 3,
};

export default function Page() {
    const params = useParams();
    const levelCode = params?.levelCode as string;
    const documentNo = params?.documentNo as string;

    const approvalLevel = levelMap[levelCode];
    const [poData, setPoData] = useState<PurchaseOrder | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [refresh, setRefresh] = useState<boolean>(false);
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

        if (documentNo) fetchData();
    }, [documentNo,refresh]);

    const handleApprovalAction = async (status: 2 | 3) => {
        setLoading(true);

        try {
            const decodedDocNo = decodeURIComponent(documentNo as string);
            const res = await fetch("/api/approval", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    documentNo: decodedDocNo,
                    approvalStatus: status,
                    approvalLevel: approvalLevel,
                }),
            });

            const responseText = await res.text();

            if (res.ok) {
                setRefresh(true)
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
                        <div className="my-4">
                            {poData?.ApprovalStatus === 'Approved' && <p className="text-sm text-green-500 font-bold">Already Approved</p>}
                            {poData?.ApprovalStatus === 'Rejected' && <p className="text-sm text-red-500 font-bold">Already Rejected</p>}
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Button onClick={() => handleApprovalAction(2)} variant="ghost" disabled={poData?.ApprovalStatus === 'Approved' || poData?.ApprovalStatus === 'Rejected'} className="bg-green-600 hover:bg-green-700 text-white hover:text-white" >
                                {loading ? (
                                    <>
                                        <span className="mr-2">
                                            <svg
                                                className="animate-spin h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                        </span>

                                    </>
                                ) : "Approve"}
                            </Button>
                            <Button onClick={() => handleApprovalAction(3)} disabled={poData?.ApprovalStatus === 'Approved' || poData?.ApprovalStatus === 'Rejected'}
                                variant="destructive">
                                Reject
                            </Button>
                        </div>

                    </div>


                    {/* Line Items Table  */}
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
