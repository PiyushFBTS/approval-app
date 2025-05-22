
export type LineItem = {
  LineNo: number;
  No: string;
  Description: string;
  Quantity: string;
  DirectUnitCost: string;
  GstAmount: string;
  GstBaseAmount: string;
};

export type PurchaseOrder = {
  DocumentType: string;
  DocumentNo: string;
  BuyFromVendorNo: string;
  BuyFromVendorName: string;
  StoreNo: string;
  StoreName: string
  OrderDate: string;
  TotalAmount: string;
  ApprovalStatus: string;
  ApprovalLevel: string;
  Lines: LineItem[];
};
