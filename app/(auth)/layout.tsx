export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100">
      {children}
    </div>
  );
}