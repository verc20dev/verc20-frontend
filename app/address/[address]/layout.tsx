export default function AddressDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 py-8 md:py-10">
      <div className="inline-block max-w-full">
        {children}
      </div>
    </section>
  );
}