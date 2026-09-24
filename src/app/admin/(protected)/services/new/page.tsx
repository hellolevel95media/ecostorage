import { ServiceForm } from "@/components/admin/ServiceForm";

export default function NewServicePage() {
  return (
    <div>
      <h2 className="text-xl font-semibold">New service</h2>
      <div className="mt-4">
        <ServiceForm />
      </div>
    </div>
  );
}
