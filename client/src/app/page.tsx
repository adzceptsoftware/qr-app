import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900">QR Digital Menu</h1>
      <p className="max-w-md text-gray-600">
        Customers scan the QR code on their table to view the menu and order.
        Staff manage the menu, tables, and incoming orders from the dashboard below.
      </p>
      <Link
        href="/login"
        className="rounded bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
      >
        Staff Login
      </Link>
    </div>
  );
}
