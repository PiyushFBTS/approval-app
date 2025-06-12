import PoViewerClient from "@/components/PoViewerClient";

export default function Page({ params }: {
  params: { levelCode: string; companyName: string; documentNo: string };
}) {
  const decodedParams = {
    levelCode: decodeURIComponent(params.levelCode),
    companyName: decodeURIComponent(params.companyName),
    documentNo: decodeURIComponent(params.documentNo),
  };

  return <PoViewerClient params={decodedParams} />;
}

