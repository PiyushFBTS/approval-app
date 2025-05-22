import { NextRequest, NextResponse } from 'next/server';
import httpntlm from 'httpntlm';

function makeNtlmRequest(documentNo: string, approvalStatus: any, approvalLevel: number,comment:string): Promise<Response> {
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <GetApprovalStatus xmlns="urn:microsoft-dynamics-schemas/codeunit/PO_Approval_API">
        <orderID>${documentNo}</orderID>
        <approvalStatus>${approvalStatus}</approvalStatus>
        <approvalLevel>${approvalLevel}</approvalLevel>
                     <comment>${comment}</comment>
      </GetApprovalStatus>
    </soap:Body>
  </soap:Envelope>`;

  return new Promise((resolve) => {
    httpntlm.post(
      {
        url: 'https://nav_auto.travelfoodservices.com:1048/Nas/WS/TFSPL%20HO/Codeunit/PO_Approval_API',
        username: 'Navjobrun',
        password: '&075JFAAWRNnEav',
        domain: 'TFS_NAV',
        workstation: '',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'urn:microsoft-dynamics-schemas/codeunit/PO_Approval_API',
        },
        body: soapEnvelope,
      },
      (err: any, res: any) => {
        if (err) {
          console.error("NTLM Request Error:", err);
          return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        }

        resolve(
          new Response(res.body, {
            status: res.statusCode,
            headers: {
              'Content-Type': 'text/xml',
            },
          })
        );

        console.log("SOAP Response Body:", res.body);
      }
    );
  });
}


export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const { documentNo, approvalStatus, approvalLevel,comment } = body;

    if (!documentNo) {
      return NextResponse.json({ error: "Missing documentNo" }, { status: 400 });
    }

    return await makeNtlmRequest(documentNo, approvalStatus, approvalLevel,comment);
  } catch (error: any) {
    console.error("Catch Block Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
