import Image from "next/image";
import FirebaseDataFetcher from "@/app/firebase/FirebaseDataFetcher";
import {DataFetchForm} from "@/components/data-fetch-form";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <DataFetchForm />
    </main>
  );
}
