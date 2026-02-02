import Image from "next/image";
import Welcome from "./welcome";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
          <Welcome />
          <a href="/pages/request" className="bg-blue-500 rounded-2xl p-2 m-4">To Request</a>
    </div>
  );
}
