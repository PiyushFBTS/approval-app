import { NextRequest, NextResponse } from 'next/server';
import httpntlm from 'httpntlm';

function makeNtlmRequest(documentNo: string): Promise<NextResponse> {
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
    <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
      <Body>
        <PurchaseOrder xmlns="urn:microsoft-dynamics-schemas/codeunit/PO_Approval_API">
          <documentNo>${documentNo}</documentNo>
        </PurchaseOrder>
      </Body>
    </Envelope>`;

  return new Promise((resolve, reject) => {
    httpntlm.post(
      {
        url: 'https://nav_auto.travelfoodservices.com:1048/Nas/WS/TFSPL%20HO/Codeunit/PO_Approval_API',
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
          return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        }

        resolve(
          NextResponse.json({
            rawXML: res.body,
            statusCode: res.statusCode,
          })
        );
      }
    );
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const { documentNo } = body;

    if (!documentNo) {
      return NextResponse.json({ error: "Missing documentNo" }, { status: 400 });
    }

    const response = await makeNtlmRequest(documentNo);
    return response;
  } catch (error: any) {
    console.error("Catch Block Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
