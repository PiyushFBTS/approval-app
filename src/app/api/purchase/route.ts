import { NextRequest, NextResponse } from 'next/server';
import httpntlm from 'httpntlm';

function makeNtlmRequest(documentNo: string, companyName: string): Promise<Response> {
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <PurchaseOrder xmlns="urn:microsoft-dynamics-schemas/codeunit/PO_Approval_API">
      <documentNo>${documentNo}</documentNo>
    </PurchaseOrder>
  </soap:Body>
</soap:Envelope>`;

  return new Promise((resolve, reject) => {
    httpntlm.post(
      {
        url: `https://nav_auto.travelfoodservices.com:1048/Nas/WS/${companyName}/Codeunit/PO_Approval_API`,
        username: 'Navjobrun',
        password: '&075JFAAWRNnEav',
        domain: 'TFS_NAV',
        workstation: '',
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'SOAPAction': 'urn:microsoft-dynamics-schemas/codeunit/PO_Approval_API#PurchaseOrder'
        },
        body: soapEnvelope,
      },
      (err: any, res: any) => {
        if (err) {
          return resolve(
            NextResponse.json({ error: err.message }, { status: 500 })
          );
        }

        resolve(
          new Response(res.body, {
            status: res.statusCode,
            headers: {
              'Content-Type': 'text/xml',
            },
          })
        );
      }
    );
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const { documentNo, companyName } = body;
   
    if (!documentNo || !companyName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    return await makeNtlmRequest(documentNo, companyName);
  } catch (error: any) {
    console.error("Catch Block Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
