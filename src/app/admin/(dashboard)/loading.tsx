import Spinner from "@/components/site/Spinner";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-ink-soft">
      <Spinner className="h-6 w-6" label="Loading..." />
    </div>
  );
}
