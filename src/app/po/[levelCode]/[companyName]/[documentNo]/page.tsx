import PoViewerClient from "@/components/PoViewerClient";

export default async function Page({ params }: {
  params: Promise<{ levelCode: string; companyName: string; documentNo: string }>
}) {
  
  const levelCode = (await params)?.levelCode
  const companyName = (await params)?.companyName
  const documentNo = (await params)?.documentNo

  const decodedParams = {
    levelCode: decodeURIComponent(levelCode),
    companyName: decodeURIComponent(companyName),
    documentNo: decodeURIComponent(documentNo),
  };

  return <PoViewerClient params={decodedParams} />;
}
