import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1>Login Form</h1>
      <Link
        className="bg-amber-600 text-white py-2 px-4 mt-4"
        href="/dashboard"
      >
        Dashboard
      </Link>
    </div>
  );
}
