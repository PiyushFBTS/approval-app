
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
  OrderDate: string;
  TotalAmount: string;
  Lines: LineItem[];
};
